# RAG System - Complete Setup Guide

## 🎯 Overview
This RAG (Retrieval Augmented Generation) system uses:
- **Supabase** (Postgres + pgvector) for vector storage
- **Gemini** (768-dimensional embeddings) for embeddings and LLM
- **FastAPI** for the Python backend
- **Node.js/Express** for the main backend
- **React** for the frontend

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **Node.js 16+** and npm installed
3. **Supabase account** with the provided credentials
4. **Gemini API key**

---

## 🚀 Step-by-Step Setup

### Step 1: Install Python Dependencies

```bash
cd RAG
pip install -r requirements.txt
```

### Step 2: Set Up the Database

Run the database setup script to create tables and enable pgvector:

```bash
python setup_db.py
```

**Expected output:**
```
✓ Database setup completed successfully!
✓ pgvector extension enabled
✓ documents table created
✓ Vector similarity search function created
```

### Step 3: Process PDFs and Generate Embeddings

This will process all PDFs in the `knowledge-base` folder and store them in Supabase:

```bash
python process_pdfs.py
```

**This process will:**
- Read 3 PDF files about cybercrime law
- Extract text and split into chunks
- Generate 768-dimensional embeddings using Gemini
- Store everything in Supabase with metadata

**⏰ Expected time:** 5-10 minutes (depends on PDF size)

**Expected output:**
```
Found 3 PDF files to process:
  - Cybercrime Law FAQs (India).pdf
  - India_Cybercrime_Law_FAQs_Compiled.pdf
  - LegalBot Knowledge Base (Complete 230 FAQs).pdf

Reading PDF: ...
✓ Extracted X chunks from Y pages
...
✓ Processed XX/XX chunks
✓ Successfully stored all chunks in database!
```

### Step 4: Start the RAG API Server

```bash
python app.py
```

Or with auto-reload:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**The API will be available at:** `http://localhost:8000`

**Test the API:**
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "documents_count": 150
}
```

### Step 5: Install Node.js Backend Dependencies

Open a **new terminal** and navigate to the server folder:

```bash
cd server
npm install
```

### Step 6: Start the Node.js Backend

```bash
node app.js
```

**The backend will be available at:** `http://localhost:3000`

### Step 7: Start the React Frontend

Open **another terminal** and navigate to the client folder:

```bash
cd client
npm install
npm run dev
```

**The frontend will be available at:** `http://localhost:5173`

---

## 🧪 Testing the Complete System

1. **Open your browser** and go to `http://localhost:5173`
2. **Login** to your account
3. **Click "Start Chatting"** on the dashboard
4. **Ask a question** like:
   - "How do I report a cybercrime in India?"
   - "What is the IT Act 2000?"
   - "How to file a complaint on the cybercrime portal?"

---

## 🔍 Troubleshooting

### Problem: Database connection error
**Solution:**
- Verify credentials in `RAG/.env`
- Check if Supabase instance is running
- Test connection: `python setup_db.py`

### Problem: "pgvector extension not found"
**Solution:**
- Run the SQL manually in Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Problem: Gemini API errors
**Solution:**
- Verify API key in `.env`
- Check API quota at: https://makersuite.google.com/app/apikey
- Ensure you're not hitting rate limits

### Problem: "RAG service is not available"
**Solution:**
- Make sure Python RAG server is running on port 8000
- Check: `curl http://localhost:8000/health`
- Restart: `python app.py`

### Problem: No results from chat
**Solution:**
- Ensure PDFs were processed: `python process_pdfs.py`
- Check document count: `http://localhost:8000/health`
- Look at Python server logs for errors

---

## 📊 Architecture Flow

```
User Query (Frontend)
    ↓
Node.js Backend (port 3000)
    ↓
Python RAG API (port 8000)
    ↓
1. Generate query embedding (Gemini)
2. Search similar docs (Supabase pgvector)
3. Generate answer with context (Gemini LLM)
    ↓
Return answer + sources
    ↓
Display in Chat UI
```

---

## 🔒 Security Notes

- The `.env` file contains sensitive credentials
- Add `.env` to `.gitignore` (already done)
- Never commit credentials to version control
- Use environment variables in production

---

## 📁 File Structure

```
RAG/
├── .env                    # Credentials
├── requirements.txt        # Python dependencies
├── setup_database.sql      # SQL schema
├── setup_db.py            # Database setup script
├── process_pdfs.py        # PDF processing script
├── app.py                 # FastAPI server
├── README.md              # This file
└── knowledge-base/        # PDF files
    ├── Cybercrime Law FAQs (India).pdf
    ├── India_Cybercrime_Law_FAQs_Compiled.pdf
    └── LegalBot Knowledge Base (Complete 230 FAQs).pdf

server/
├── app.js                 # Main server
├── package.json
└── routes/
    └── rag.js             # RAG integration routes

client/
└── src/
    └── components/
        ├── Dashboard.jsx  # Main dashboard
        ├── Chat.jsx       # Chat component
        └── Chat.css       # Chat styles
```

---

## 🎉 Success Indicators

✅ Database setup completed  
✅ PDFs processed and embedded  
✅ RAG API health check passes  
✅ Node.js backend running  
✅ Frontend accessible  
✅ Chat interface working  
✅ Getting relevant answers from the knowledge base  

---

## 🆘 Need Help?

Check logs in each terminal:
1. **Python RAG server** - Shows API requests and errors
2. **Node.js backend** - Shows routing and proxy errors
3. **React frontend** - Shows client-side errors in browser console

---

## 🔄 Updating the Knowledge Base

To add new PDFs:
1. Add PDF files to `RAG/knowledge-base/`
2. Run: `python process_pdfs.py`
3. Restart the RAG API: `python app.py`
