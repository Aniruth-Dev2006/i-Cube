# 🏛️ I-Cube Legal Chatbot - AI-Powered Legal Assistant

<div align="center">

![Status](https://img.shields.io/badge/Status-Ready-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Node](https://img.shields.io/badge/Node-16+-green)
![React](https://img.shields.io/badge/React-18-61dafb)

**An intelligent legal assistant powered by RAG (Retrieval Augmented Generation) technology**

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 🎯 What is This?

A comprehensive legal chatbot system that helps users understand Indian cybercrime law through:
- **AI-powered conversations** using Gemini LLM
- **Vector similarity search** with 768-dimensional embeddings
- **Verified legal knowledge** from curated PDF documents
- **Source citations** for transparency and trust
- **Modern, responsive** chat interface

## ✨ Features

### 🤖 Intelligent Chat Assistant
- Real-time AI responses to legal queries
- Context-aware answers using RAG technology
- Source attribution with document and page references
- Relevance scoring for each source

### 🔐 User Management
- Local authentication (email/password)
- Google OAuth integration
- Profile management with picture upload
- Session management

### 📚 Knowledge Base
- Pre-loaded with 3 comprehensive PDFs on Indian cybercrime law
- 150+ chunked documents with semantic search
- Easy to update with new documents

### 🎨 Modern UI/UX
- Beautiful, responsive design
- Dark/Light theme toggle
- Smooth animations and transitions
- Mobile-friendly interface

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (for authentication)

### One-Command Setup

```powershell
# First time setup (10-15 minutes)
.\setup-all.ps1

# Start all services
.\start-all.ps1
```

### Access the Application
Open your browser and go to: **http://localhost:5173**

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) | ✅ Step-by-step setup guide with verification |
| [QUICK_START.md](QUICK_START.md) | 🚀 Quick commands and references |
| [SETUP_MAIN.md](SETUP_MAIN.md) | 📘 Comprehensive setup instructions |
| [SETUP_RAG.md](SETUP_RAG.md) | 🔍 Detailed RAG system documentation |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | 📊 What was built and how it works |

**Start here:** [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) ⭐

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                      │
│              React + Vite (Port 5173)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  Node.js Backend                        │
│            Express + Passport (Port 3000)               │
│              - Authentication                           │
│              - RAG Proxy                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   Python RAG API                        │
│           FastAPI + Gemini (Port 8000)                  │
│              - Query Processing                         │
│              - Embedding Generation                     │
│              - Response Generation                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Supabase (Postgres + pgvector)             │
│              - Vector Storage (768d)                    │
│              - Similarity Search                        │
│              - Document Metadata                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, CSS3 |
| **Backend** | Node.js, Express, Passport.js |
| **RAG API** | Python, FastAPI, Uvicorn |
| **AI/ML** | Google Gemini (embedding-001, gemini-pro) |
| **Database** | PostgreSQL (Supabase), pgvector, MongoDB |
| **Auth** | Local + Google OAuth 2.0 |

---

## 📁 Project Structure

```
i-cube/
├── RAG/                          # Python RAG System
│   ├── knowledge-base/          # PDF documents
│   ├── app.py                   # FastAPI server
│   ├── process_pdfs.py          # PDF processor
│   ├── setup_db.py              # Database setup
│   └── test_rag.py              # Test suite
│
├── server/                       # Node.js Backend
│   ├── app.js                   # Main server
│   ├── routes/                  # API routes
│   ├── models/                  # Database models
│   └── config/                  # Configuration
│
├── client/                       # React Frontend
│   └── src/
│       ├── components/          # React components
│       ├── context/             # Context providers
│       └── services/            # API services
│
├── setup-all.ps1                # Automated setup
├── start-all.ps1                # Start all services
└── [Documentation files]        # Setup & usage guides
```

---

## 🎮 Usage

### 1. Login/Signup
- Create an account or use Google OAuth
- Complete your profile

### 2. Access Dashboard
- View available features
- Manage your profile

### 3. Start Chatting
- Click "Start Chatting"
- Ask questions about cybercrime law
- Get AI-powered answers with sources

### Sample Questions
```
• How do I report a cybercrime in India?
• What is the IT Act 2000?
• How to file a complaint on the cybercrime portal?
• What are the penalties for cyberstalking?
• How to report online fraud?
```

---

## 🧪 Testing

### Quick Test
```powershell
cd RAG
python test_rag.py
```

### Health Checks
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
  -d '{"query": "How to report cybercrime?"}'
```

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Query Processing | 3-6 seconds |
| Embedding Generation | ~200ms |
| Vector Search | ~50ms |
| Documents Retrieved | 5 per query |
| Embedding Dimensions | 768 |

---

## 🔒 Security

- ✅ Environment variables for sensitive data
- ✅ .gitignore for credentials
- ✅ Session management
- ✅ CORS configuration
- ✅ Input validation
- ✅ Secure password hashing

---

## 🐛 Troubleshooting

### Common Issues

**Service won't start?**
- Check if ports 3000, 5173, 8000 are available
- Verify all dependencies are installed

**No chat responses?**
- Ensure RAG API is running (port 8000)
- Check: http://localhost:8000/health
- Verify documents were processed

**Database errors?**
- Run: `python RAG/setup_db.py`
- Check Supabase credentials in `.env`

See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for detailed troubleshooting.

---

## 🔄 Updating Knowledge Base

To add new PDF documents:

```powershell
# 1. Add PDFs to RAG/knowledge-base/
# 2. Process new documents
cd RAG
python process_pdfs.py

# 3. Restart RAG API
python app.py
```

---

## 🤝 Contributing

This is a complete, production-ready system. To extend:

1. **Add new features** to the dashboard
2. **Expand knowledge base** with more PDFs
3. **Enhance UI/UX** with additional themes
4. **Add analytics** for usage tracking
5. **Implement chat history** persistence

---

## 📝 License

This project is for educational and demonstration purposes.

---

## 🎉 Success Checklist

- [ ] All services running (RAG API, Backend, Frontend)
- [ ] Can login/signup successfully
- [ ] Chat interface opens
- [ ] Receiving AI responses
- [ ] Sources displayed correctly
- [ ] Theme toggle works
- [ ] Profile management works

---

## 📞 Support

### Quick Help
- Check service status: `curl http://localhost:8000/health`
- Review logs in each terminal
- Verify `.env` file exists in RAG folder

### Documentation
Start with [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for guided setup.

---

<div align="center">

**Built with ❤️ using React, FastAPI, and Gemini AI**

[Get Started](SETUP_CHECKLIST.md) • [Report Issue](#) • [Request Feature](#)

</div>
