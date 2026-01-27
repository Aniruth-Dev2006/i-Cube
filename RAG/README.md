# RAG System Setup and Usage Guide

## Prerequisites

1. Python 3.8 or higher installed
2. Supabase account with PostgreSQL database
3. Gemini API key

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd RAG
pip install -r requirements.txt
```

### 2. Set Up Database

Run the database setup script to create the necessary tables and functions:

```bash
python setup_db.py
```

This will:
- Enable the pgvector extension
- Create the documents table with vector embeddings
- Set up similarity search functions

### 3. Process PDFs and Create Embeddings

Process the PDF files and store them in the vector database:

```bash
python process_pdfs.py
```

This will:
- Read all PDF files from the `knowledge-base` folder
- Split them into chunks
- Generate 768-dimensional embeddings using Gemini
- Store everything in Supabase

**Note:** This may take several minutes depending on the number of PDFs.

### 4. Start the RAG API Server

Start the FastAPI server:

```bash
python app.py
```

Or using uvicorn directly:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## API Endpoints

### Health Check
```
GET http://localhost:8000/health
```

### Query Knowledge Base
```
POST http://localhost:8000/query
Content-Type: application/json

{
  "query": "How do I report cybercrime in India?",
  "max_results": 5
}
```

Response:
```json
{
  "answer": "Detailed answer from the AI...",
  "sources": [
    {
      "content": "Relevant excerpt...",
      "source": "filename.pdf",
      "page": 5,
      "similarity": 0.87
    }
  ]
}
```

## Testing the System

1. **Test with curl:**
```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"What is the IT Act 2000?\"}"
```

2. **Test with Python:**
```python
import requests

response = requests.post(
    "http://localhost:8000/query",
    json={"query": "How to file a cybercrime complaint?"}
)
print(response.json())
```

## Architecture

```
User Query
    ↓
Generate Query Embedding (Gemini)
    ↓
Vector Similarity Search (Supabase + pgvector)
    ↓
Retrieve Top K Similar Documents
    ↓
Generate Answer with Context (Gemini LLM)
    ↓
Return Answer + Sources
```

## Configuration

All credentials are stored in `.env` file:
- Postgres/Supabase credentials for vector storage
- Gemini API key for embeddings and LLM
- Embedding dimension: 768 (Gemini embedding-001 model)

## Troubleshooting

**Database connection error:**
- Verify credentials in `.env`
- Check if Supabase instance is running
- Ensure pgvector extension is installed

**Embedding generation error:**
- Verify Gemini API key
- Check API quota/rate limits
- Ensure internet connection

**No results found:**
- Run `process_pdfs.py` to populate database
- Check if documents were inserted: Query the health endpoint

## Next Steps

The backend (Node.js) and frontend (React) integration is set up to connect to this RAG service at `http://localhost:8000`.
