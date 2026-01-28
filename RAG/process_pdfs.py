import os
import json
from dotenv import load_dotenv
from pypdf import PdfReader
import psycopg2
from psycopg2.extras import execute_values
import time
from sentence_transformers import SentenceTransformer

load_dotenv()

# Load local embedding model (same as app.py)
print("Loading embedding model...")
embedding_model_local = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
print("✓ Embedding model loaded!")

class PDFProcessor:
    def __init__(self):
        self.embedding_model = embedding_model_local
        self.db_conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )
        
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF file"""
        print(f"Reading PDF: {pdf_path}")
        reader = PdfReader(pdf_path)
        text_chunks = []
        
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text.strip():
                # Split into smaller chunks (approximately 1000 characters each)
                chunks = self.split_text(text, chunk_size=1000, overlap=200)
                for chunk_idx, chunk in enumerate(chunks):
                    text_chunks.append({
                        'content': chunk,
                        'metadata': {
                            'source': os.path.basename(pdf_path),
                            'page': page_num + 1,
                            'chunk': chunk_idx
                        }
                    })
        
        print(f"✓ Extracted {len(text_chunks)} chunks from {len(reader.pages)} pages")
        return text_chunks
    
    def split_text(self, text, chunk_size=1000, overlap=200):
        """Split text into overlapping chunks"""
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < text_length:
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                
                if break_point > chunk_size * 0.5:  # If we found a reasonable break point
                    chunk = text[start:start + break_point + 1]
                    end = start + break_point + 1
            
            chunks.append(chunk.strip())
            start = end - overlap if end < text_length else text_length
        
        return chunks
    
    def generate_embedding(self, text):
        """Generate embedding using local sentence-transformers model"""
        try:
            embedding = self.embedding_model.encode(text)
            return embedding.tolist()
        except Exception as e:
            print(f"Error generating embedding: {str(e)}")
            return None
    
    def store_chunks_in_db(self, chunks):
        """Store text chunks with embeddings in database"""
        cursor = self.db_conn.cursor()
        
        print(f"Generating embeddings and storing {len(chunks)} chunks...")
        
        for idx, chunk in enumerate(chunks):
            try:
                # Generate embedding
                embedding = self.generate_embedding(chunk['content'])
                
                if embedding:
                    # Insert into database
                    cursor.execute(
                        """
                        INSERT INTO documents (content, metadata, embedding)
                        VALUES (%s, %s, %s)
                        """,
                        (
                            chunk['content'],
                            json.dumps(chunk['metadata']),
                            embedding
                        )
                    )
                    
                    if (idx + 1) % 10 == 0:
                        print(f"✓ Processed {idx + 1}/{len(chunks)} chunks")
                        self.db_conn.commit()
                
            except Exception as e:
                print(f"Error processing chunk {idx}: {str(e)}")
                continue
        
        self.db_conn.commit()
        cursor.close()
        print(f"✓ Successfully stored all chunks in database!")
    
    def process_knowledge_base(self, knowledge_base_dir):
        """Process all PDFs in knowledge base directory"""
        pdf_files = [f for f in os.listdir(knowledge_base_dir) if f.endswith('.pdf')]
        
        print(f"\nFound {len(pdf_files)} PDF files to process:")
        for pdf_file in pdf_files:
            print(f"  - {pdf_file}")
        
        all_chunks = []
        
        for pdf_file in pdf_files:
            pdf_path = os.path.join(knowledge_base_dir, pdf_file)
            chunks = self.extract_text_from_pdf(pdf_path)
            all_chunks.extend(chunks)
        
        print(f"\nTotal chunks to process: {len(all_chunks)}")
        self.store_chunks_in_db(all_chunks)
    
    def close(self):
        """Close database connection"""
        self.db_conn.close()

def main():
    processor = PDFProcessor()
    
    try:
        # Process both knowledge base directories
        base_dir = os.path.dirname(__file__)
        
        # Old knowledge base
        old_kb_dir = os.path.join(base_dir, 'knowledge-base')
        if os.path.exists(old_kb_dir):
            print("\n=== Processing 'knowledge-base' folder ===")
            processor.process_knowledge_base(old_kb_dir)
        
        # New knowledge base
        new_kb_dir = os.path.join(base_dir, 'New Knowledge Base')
        if os.path.exists(new_kb_dir):
            print("\n=== Processing 'New Knowledge Base' folder ===")
            processor.process_knowledge_base(new_kb_dir)
        
        print("\n✓ All knowledge bases processed successfully!")
        
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        raise
    finally:
        processor.close()

if __name__ == "__main__":
    main()
