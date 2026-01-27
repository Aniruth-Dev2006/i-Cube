import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from google import genai
from google.genai import types

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
    print("✓ Gemini API configured successfully")
else:
    client = None
    print("Warning: GEMINI_API_KEY not found")

# Load models locally
print("Loading embedding model...")
embedding_model_local = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
print("Embedding model loaded successfully")

app = FastAPI(title="RAG API", description="Legal Knowledge Base RAG System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    max_results: Optional[int] = 5
    conversation_history: Optional[List[dict]] = None

class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]

class RAGSystem:
    def __init__(self):
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
        self.llm_model = os.getenv("LLM_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")
        self.db_conn = None
        self.connect_db()
    
    def connect_db(self):
        """Connect to PostgreSQL database"""
        try:
            self.db_conn = psycopg2.connect(
                host=os.getenv("DB_HOST"),
                port=os.getenv("DB_PORT"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD")
            )
        except Exception as e:
            print(f"Database connection error: {str(e)}")
            raise
    
    def generate_embedding(self, text: str):
        """Generate embedding using local sentence-transformers"""
        try:
            # Generate embedding locally - much faster and more reliable!
            embedding = embedding_model_local.encode(text)
            return embedding.tolist()
        except Exception as e:
            print(f"Embedding generation error: {str(e)}")
            raise
    
    def search_similar_documents(self, query_embedding, max_results=5):
        """Search for similar documents using vector similarity"""
        try:
            cursor = self.db_conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute(
                """
                SELECT 
                    id,
                    content,
                    metadata,
                    1 - (embedding <=> %s::vector) AS similarity
                FROM documents
                WHERE 1 - (embedding <=> %s::vector) > 0.3
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (query_embedding, query_embedding, query_embedding, max_results)
            )
            
            results = cursor.fetchall()
            cursor.close()
            
            return results
        except Exception as e:
            print(f"Search error: {str(e)}")
            raise
    
    def generate_answer(self, query: str, context_docs: List[dict], conversation_history: Optional[List[dict]] = None) -> str:
        """Generate answer using Gemini API to understand query and context"""
        try:
            # Build conversation context first (needed for follow-up questions)
            conversation_context = ""
            if conversation_history and len(conversation_history) > 0:
                recent = conversation_history[-4:]  # Last 4 messages (2 exchanges)
                for msg in recent:
                    role = "User" if msg.get('role') == 'user' else "Assistant"
                    content = msg.get('content', '')
                    conversation_context += f"{role}: {content}\n\n"
            
            # For follow-up questions (short queries with conversation history), use Gemini even without docs
            is_followup = conversation_context and len(query.split()) < 10
            
            if not context_docs and not is_followup:
                return "I couldn't find specific information about this topic in my legal knowledge base. Please rephrase your question or ask about Indian cybercrime law, legal procedures, or related topics."
            
            # Prepare context from documents
            context_parts = []
            if context_docs:
                for doc in context_docs[:5]:  # Top 5 most relevant docs
                    content = doc['content'].strip()
                    # Clean citations
                    content = content.replace('[cite_start]', '').replace('[cite_end]', '')
                    content = content.replace('[cite:', '').replace(']', '')
                    context_parts.append(content)
            
            context = "\n\n---\n\n".join(context_parts) if context_parts else ""
            
            # Use Gemini API to generate intelligent answer
            if client:
                try:
                    # Create prompt for Gemini (conversation_context already built above)
                    prompt = f"""You are a legal assistant specializing in Indian cybercrime law. Answer the user's question based on the provided legal documents and conversation history.

User Question: {query}

{f"Previous Conversation:\n{conversation_context}" if conversation_context else ""}

{f"Legal Context from Documents:\n{context}" if context else ""}

Instructions:
1. IMPORTANT: If this is a follow-up question, use the previous conversation to understand the context
2. For follow-up questions like "give one perfect section to file case", refer to the specific crime discussed in the previous conversation
3. Understand the user's specific situation and question
4. Find the most relevant information from the legal context OR previous conversation
5. Provide a clear, structured answer with:
   - Direct answer to their question (Yes/No if applicable)
   - List of applicable criminal offences with section numbers (IPC, IT Act, BNS)
   - Immediate practical steps they should take
   - Specific remedies and legal protections available
   - Contact information (helplines, cyber crime portal)
6. Format professionally with clear sections and bullet points
7. Be comprehensive but concise (aim for 300-500 words)
8. Use practical, actionable language

Answer:"""
                    
                    print(f"Calling Gemini API for query: {query[:50]}...")
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=prompt
                    )
                    answer = response.text.strip()
                    
                    if answer:
                        print("✓ Gemini generated answer successfully")
                        return answer
                    else:
                        print("Gemini returned empty response")
                        raise Exception("Empty response from Gemini")
                        
                except Exception as e:
                    print(f"Gemini API error: {str(e)}")
                    # Fall through to fallback
            
            # Fallback if Gemini fails or not configured
            print("Using fallback answer generation...")
            
            # Combine all document content
            all_content = "\n\n".join([doc['content'] for doc in context_docs])
            clean_content = all_content.replace('[cite_start]', '').replace('[cite_end]', '')
            clean_content = clean_content.replace('[cite:', '').replace(']', '')
            
            # Check if asking for sections
            query_lower = query.lower()
            asking_for_section = any(word in query_lower for word in ['section', 'which law', 'what law', 'file case', 'file complaint', 'report', 'perfect section'])
            
            # If asking for specific section, look for section numbers
            if asking_for_section:
                import re
                sections_found = []
                section_details = {}
                
                # Look for section mentions in all content
                section_patterns = [
                    (r'Section\s+(\d+[A-Z]*)', 'Section'),
                    (r'IPC\s+Section\s+(\d+[A-Z]*)', 'IPC Section'),
                    (r'IT\s+Act\s+Section\s+(\d+[A-Z]*)', 'IT Act Section'),
                    (r'BNS\s+Section\s+(\d+[A-Z]*)', 'BNS Section'),
                    (r'Section\s+(\d+[A-Z]*)\s+of\s+IT\s+Act', 'IT Act Section'),
                    (r'(354D)', 'IPC Section'),  # Specific cyber stalking section
                    (r'(66E)', 'IT Act Section'),  # Privacy violation section
                ]
                
                for pattern, prefix in section_patterns:
                    matches = re.finditer(pattern, all_content, re.IGNORECASE)
                    for match in matches:
                        section_num = match.group(1) if match.lastindex else match.group(0)
                        section_full = f"{prefix} {section_num}"
                        
                        if section_full not in section_details:
                            # Get context around this section
                            pos = match.start()
                            # Look for the complete explanation
                            start = max(0, pos - 50)
                            end = min(len(all_content), pos + 250)
                            context = all_content[start:end]
                            
                            # Clean up
                            context = context.replace('[cite_start]', '').replace('[cite_end]', '')
                            context = context.replace('[cite:', '').replace(']', '')
                            
                            # Extract the relevant sentence
                            sentences = context.split('.')
                            relevant = ''
                            for sent in sentences:
                                if section_num in sent or prefix.split()[0] in sent:
                                    relevant = sent.strip()
                                    break
                            
                            if relevant and len(relevant) > 20:
                                section_details[section_full] = relevant
                                sections_found.append(section_full)
                        
                        if len(sections_found) >= 3:
                            break
                    if len(sections_found) >= 3:
                        break
                
                if sections_found:
                    answer = "**⚖️ Yes, this is punishable under Indian law.**\n\n"
                    answer += "**Applicable Legal Sections:**\n\n"
                    
                    for i, section in enumerate(sections_found[:3], 1):
                        detail = section_details[section]
                        # Clean up and format detail
                        detail = ' '.join(detail.split())
                        if len(detail) > 150:
                            detail = detail[:150] + "..."
                        answer += f"{i}. **{section}**\n   {detail}\n\n"
                    
                    answer += "---\n\n"
                    answer += "**📋 How to File a Complaint:**\n\n"
                    answer += "1. **Online**: Visit cybercrime.gov.in and file an e-FIR\n"
                    answer += "2. **Offline**: Visit your nearest cybercrime police station\n"
                    answer += "3. **Evidence**: Collect screenshots, messages, URLs, and timestamps\n"
                    answer += "4. **Legal Help**: Consult a lawyer for proper case filing\n\n"
                    answer += "**🆘 Emergency Helpline**: 1930 (Cyber Crime Helpline)"
                    return answer
            
            # For general questions, find the most relevant answer
            # Clean up all content
            clean_content = all_content.replace('[cite_start]', '').replace('[cite_end]', '')
            clean_content = clean_content.replace('[cite:', '').replace(']', '')
            
            # Look for Q&A pairs that match the query
            import re
            qa_pattern = r'Q[:\d]*\s*(.+?)\s*A[:\d]*\s*(.+?)(?=Q[:\d]|$)'
            qa_matches = re.findall(qa_pattern, clean_content, re.DOTALL | re.IGNORECASE)
            
            best_qa = []
            query_terms = set(query_lower.split())
            
            for question, answer_text in qa_matches:
                question = question.strip()
                answer_text = answer_text.strip()
                
                # Skip very short or empty
                if len(question) < 10 or len(answer_text) < 10:
                    continue
                
                # Calculate relevance score
                q_words = set(question.lower().split())
                relevance = len(query_terms.intersection(q_words))
                
                if relevance > 0:
                    # Clean up the answer
                    answer_text = answer_text.split('Q:')[0].split('Q1')[0].strip()
                    # Remove extra whitespace
                    answer_text = ' '.join(answer_text.split())
                    # Limit length
                    if len(answer_text) > 300:
                        answer_text = answer_text[:300] + "..."
                    best_qa.append((relevance, question, answer_text))
            
            # Sort by relevance
            best_qa.sort(reverse=True, key=lambda x: x[0])
            
            if best_qa:
                # Create structured answer with the most relevant Q&A
                answer = "**📋 Legal Information:**\n\n"
                
                # Show top 2-3 most relevant
                for i, (_, q, a) in enumerate(best_qa[:3], 1):
                    # Clean up question
                    q = q.replace('What is', '').replace('Is', '').strip()
                    if not q.endswith('?'):
                        q += '?'
                    
                    answer += f"**{i}. {q}**\n\n{a}\n\n"
                    answer += "---\n\n"
                
                answer += "**📞 Next Steps:**\n"
                answer += "• File a complaint at your nearest cybercrime police station\n"
                answer += "• Report online at: cybercrime.gov.in\n"
                answer += "• Consult with a lawyer for legal guidance\n"
                answer += "• Keep all evidence (screenshots, messages, URLs)"
                
                return answer
            else:
                # Fallback: Extract first meaningful paragraphs with better formatting
                paragraphs = [p.strip() for p in clean_content.split('\n\n') if len(p.strip()) > 50]
                
                if paragraphs:
                    answer = "**📋 Legal Information:**\n\n"
                    # Take first 2 relevant paragraphs
                    content = ' '.join(paragraphs[:2])
                    if len(content) > 400:
                        content = content[:400] + "..."
                    answer += content
                    answer += "\n\n**📞 Next Steps:**\n"
                    answer += "• Consult with a qualified lawyer\n"
                    answer += "• Visit your nearest cybercrime police station\n"
                    answer += "• File online complaint at cybercrime.gov.in"
                    return answer
                else:
                    return "I couldn't find specific information about this topic. Please consult with a legal expert or visit your nearest cybercrime police station."
            
        except Exception as e:
            print(f"Answer generation error: {str(e)}")
            import traceback
            traceback.print_exc()
            return "I apologize, but I'm having trouble processing your request. Please try rephrasing your question."
    
    def is_greeting_or_casual(self, text: str) -> bool:
        """Check if the query is a greeting or casual conversation"""
        text_lower = text.lower().strip()
        greetings = [
            'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 
            'good evening', 'good day', 'howdy', 'hiya', 'sup', 'yo',
            'how are you', 'how do you do', 'whats up', "what's up",
            'hows it going', "how's it going", 'nice to meet you'
        ]
        
        casual_queries = [
            'thank you', 'thanks', 'thank', 'bye', 'goodbye', 'see you',
            'ok', 'okay', 'yes', 'no', 'sure', 'cool', 'great', 'awesome'
        ]
        
        # Only exact matches for greetings, allow longer queries through
        return text_lower in greetings or text_lower in casual_queries
    
    def handle_greeting(self, query: str) -> str:
        """Generate appropriate response for greetings"""
        query_lower = query.lower().strip()
        
        if any(g in query_lower for g in ['hi', 'hello', 'hey', 'howdy', 'hiya']):
            return "Hello! I'm your legal assistant specializing in Indian cybercrime law and legal matters. How can I help you today?"
        elif any(g in query_lower for g in ['good morning']):
            return "Good morning! I'm here to help you with legal questions, particularly related to cybercrime law. What would you like to know?"
        elif any(g in query_lower for g in ['good afternoon']):
            return "Good afternoon! I'm your legal assistant. Feel free to ask me any questions about cybercrime law or legal procedures."
        elif any(g in query_lower for g in ['good evening']):
            return "Good evening! I'm here to assist you with legal questions. How may I help you?"
        elif any(g in query_lower for g in ['how are you', 'whats up', "what's up"]):
            return "I'm functioning well, thank you! I'm ready to help you with legal questions, especially regarding cybercrime law and procedures. What can I assist you with?"
        elif any(g in query_lower for g in ['thank', 'thanks']):
            return "You're welcome! Feel free to ask if you have any more questions."
        elif any(g in query_lower for g in ['bye', 'goodbye', 'see you']):
            return "Goodbye! Don't hesitate to return if you need legal assistance in the future."
        else:
            return "Hello! I'm your legal assistant. I can help you with questions about cybercrime law, legal procedures, and more. What would you like to know?"
    
    def query(self, query_text: str, max_results: int = 5, conversation_history: Optional[List[dict]] = None):
        """Main RAG query function with conversation memory"""
        try:
            # Check for greetings first
            if self.is_greeting_or_casual(query_text):
                return {
                    "answer": self.handle_greeting(query_text),
                    "sources": []
                }
            
            # Generate query embedding
            query_embedding = self.generate_embedding(query_text)
            
            # Search for similar documents
            similar_docs = self.search_similar_documents(query_embedding, max_results)
            
            # Generate answer - even if no similar docs found, allow LLM to respond
            if similar_docs:
                answer = self.generate_answer(query_text, similar_docs, conversation_history)
            else:
                # No documents found, but still allow LLM to answer general questions
                print("No similar documents found, allowing general response...")
                answer = self.generate_answer(query_text, [], conversation_history)
            
            # Prepare sources only if documents were found
            sources = []
            if similar_docs:
                sources = [
                    {
                        "content": doc['content'][:200] + "...",  # Truncate for response
                        "source": doc['metadata'].get('source', 'Unknown'),
                        "page": doc['metadata'].get('page', 'N/A'),
                        "similarity": float(doc['similarity'])
                    }
                    for doc in similar_docs
                ]
            
            return {
                "answer": answer,
                "sources": sources
            }
            
        except Exception as e:
            print(f"Query error: {str(e)}")
            raise

# Initialize RAG system
rag_system = RAGSystem()

@app.get("/")
async def root():
    return {
        "message": "Legal RAG API is running",
        "endpoints": {
            "/query": "POST - Query the knowledge base",
            "/health": "GET - Health check"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        cursor = rag_system.db_conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM documents")
        doc_count = cursor.fetchone()[0]
        cursor.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "documents_count": doc_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.post("/query", response_model=QueryResponse)
async def query_knowledge_base(request: QueryRequest):
    """Query the knowledge base with RAG and conversation memory"""
    try:
        if not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        result = rag_system.query(
            request.query, 
            request.max_results,
            request.conversation_history
        )
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@app.on_event("shutdown")
async def shutdown():
    """Close database connection on shutdown"""
    if rag_system.db_conn:
        rag_system.db_conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
