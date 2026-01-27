# I-Cube Legal Chatbot - Complete Setup Guide

## 🎯 Project Overview

A comprehensive legal chatbot system with:
- **User Authentication** (Local & Google OAuth)
- **RAG (Retrieval Augmented Generation)** for legal knowledge queries
- **Vector Search** using Supabase + pgvector
- **AI-Powered Responses** using Gemini (768-dimensional embeddings)
- **Interactive Chat Interface** with source citations

---

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
Backend (Node.js + Express)
    ↓
RAG API (FastAPI + Python)
    ↓
Supabase (Postgres + pgvector) + Gemini AI
```

---

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+** and npm
- **Supabase account** (credentials provided)
- **Gemini API key** (provided)
- **MongoDB** (for user authentication)

---

## 🚀 Quick Start (Automated)

### Option 1: Full Setup (First Time)

```powershell
# Run this once to set up everything
.\setup-all.ps1
```

This will:
1. Install Python dependencies
2. Set up Supabase database with pgvector
3. Process PDFs and generate embeddings
4. Install Node.js backend dependencies
5. Install React frontend dependencies

### Option 2: Start All Services

```powershell
# After setup, use this to start all services
.\start-all.ps1
```

This will start:
- Python RAG API (port 8000)
- Node.js Backend (port 3000)
- React Frontend (port 5173)

---

## 🔧 Manual Setup (Step by Step)

### 1. RAG System Setup

See detailed instructions in [SETUP_RAG.md](SETUP_RAG.md)

**Quick version:**
```bash
cd RAG
pip install -r requirements.txt
python setup_db.py
python process_pdfs.py
python app.py
```

### 2. Backend Setup

```bash
cd server
npm install
node app.js
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🧪 Testing

### Test RAG System
```bash
cd RAG
python test_rag.py
```

### Test Health Endpoints
```bash
# RAG API
curl http://localhost:8000/health

# Backend
curl http://localhost:3000/rag/health
```

### Manual Query Test
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I report cybercrime?"}'
```

---

## 📁 Project Structure

```
i-cube/
├── RAG/                          # Python RAG System
│   ├── .env                      # Credentials (DO NOT COMMIT)
│   ├── requirements.txt          # Python dependencies
│   ├── setup_db.py              # Database setup
│   ├── process_pdfs.py          # PDF processing
│   ├── app.py                   # FastAPI server
│   ├── test_rag.py              # Testing script
│   ├── setup_database.sql       # SQL schema
│   └── knowledge-base/          # PDF files
│
├── server/                       # Node.js Backend
│   ├── app.js                   # Main server
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── rag.js               # RAG integration routes
│
├── client/                       # React Frontend
│   └── src/
│       └── components/
│           ├── Dashboard.jsx    # Main dashboard
│           ├── Chat.jsx         # Chat interface
│           └── Chat.css         # Chat styles
│
├── setup-all.ps1                # Automated setup script
├── start-all.ps1                # Start all services
├── SETUP_MAIN.md                # This file
└── SETUP_RAG.md                 # Detailed RAG setup guide
```

---

## 🎮 Using the Application

### 1. Access the Application
Open your browser and go to: **http://localhost:5173**

### 2. Create an Account
- Click "Sign Up"
- Fill in your details or use Google OAuth

### 3. Start Chatting
- Click "Start Chatting" on the dashboard
- Ask questions about Indian cybercrime law
- Get AI-powered answers with source citations

### Sample Questions:
- "How do I report a cybercrime in India?"
- "What is the IT Act 2000?"
- "How to file a complaint on the National Cybercrime Portal?"
- "What are the penalties for cyberstalking?"

---

## 🔍 Features

### ✅ Authentication
- Local authentication
- Google OAuth
- Profile management
- Session management

### ✅ RAG System
- Vector similarity search (768-dimensional)
- Gemini embeddings and LLM
- Source attribution
- Real-time responses

### ✅ Chat Interface
- Modern, responsive design
- Message history
- Source citations
- Typing indicators

---

## 🐛 Troubleshooting

### "Cannot connect to RAG API"
✅ Make sure Python server is running: `python app.py`  
✅ Check port 8000 is not in use

### "Database connection error"
✅ Verify Supabase credentials in `.env`  
✅ Run `python setup_db.py` again

### "No results from chat"
✅ Run `python process_pdfs.py` to populate database  
✅ Check: `http://localhost:8000/health`

---

## 🔄 Updating Knowledge Base

To add new PDF files:

1. Add PDFs to `RAG/knowledge-base/`
2. Run: `python process_pdfs.py`
3. Restart RAG API

---

## 🎉 Success Checklist

- [ ] Python dependencies installed
- [ ] Database setup completed
- [ ] PDFs processed
- [ ] RAG API running (port 8000)
- [ ] Backend running (port 3000)
- [ ] Frontend running (port 5173)
- [ ] Can login to application
- [ ] Chat interface working
- [ ] Getting relevant answers

---

**Ready to start?** Run `.\setup-all.ps1` and then `.\start-all.ps1`!
