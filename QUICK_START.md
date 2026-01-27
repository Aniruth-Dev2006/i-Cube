# 🚀 Quick Reference Guide

## One-Command Setup & Start

### First Time Setup
```powershell
.\setup-all.ps1
```

### Start All Services
```powershell
.\start-all.ps1
```

---

## URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **RAG API:** http://localhost:8000
- **Health Check:** http://localhost:8000/health

---

## Manual Start Commands

### Terminal 1: RAG API
```bash
cd RAG
python app.py
```

### Terminal 2: Backend
```bash
cd server
node app.js
```

### Terminal 3: Frontend
```bash
cd client
npm run dev
```

---

## Test Commands

```bash
# Test RAG system
cd RAG
python test_rag.py

# Test health
curl http://localhost:8000/health

# Test query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"How to report cybercrime?\"}"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | Kill process: `Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess \| Stop-Process` |
| RAG not responding | Check if Python server is running |
| No chat results | Run `python process_pdfs.py` |
| Database error | Run `python setup_db.py` |

---

## File Locations

- **Credentials:** `RAG/.env`
- **PDFs:** `RAG/knowledge-base/`
- **Backend Routes:** `server/routes/`
- **Frontend Components:** `client/src/components/`

---

## Sample Queries

- How do I report a cybercrime in India?
- What is the IT Act 2000?
- How to file complaint on cybercrime portal?
- What are penalties for cyberstalking?
- How to report online fraud?

---

## Key Features

✅ User Authentication (Local + Google OAuth)  
✅ AI-Powered Legal Assistant  
✅ Vector Similarity Search  
✅ Source Citations  
✅ Real-time Chat Interface  
✅ Dark/Light Theme  

---

## Support

📖 Detailed Guide: [SETUP_MAIN.md](SETUP_MAIN.md)  
📖 RAG Setup: [SETUP_RAG.md](SETUP_RAG.md)  
🧪 Test Script: `python RAG/test_rag.py`
