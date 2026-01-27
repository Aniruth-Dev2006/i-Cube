# ✅ Setup Checklist - Follow This Step by Step

## 📋 Pre-Setup Verification

- [ ] Python 3.8+ is installed
  ```powershell
  python --version
  ```

- [ ] Node.js 16+ is installed
  ```powershell
  node --version
  ```

- [ ] MongoDB is running (for authentication)
  ```powershell
  # Start MongoDB if not running
  ```

---

## 🚀 Setup Process

### Option A: Automated Setup (Recommended)

- [ ] **Step 1:** Open PowerShell in the project folder
- [ ] **Step 2:** Run the setup script
  ```powershell
  .\setup-all.ps1
  ```
- [ ] **Step 3:** Wait for completion (10-15 minutes)
- [ ] **Step 4:** Verify all steps completed successfully

---

### Option B: Manual Setup

#### Part 1: RAG System Setup

- [ ] **1.1** Open terminal and navigate to RAG folder
  ```powershell
  cd RAG
  ```

- [ ] **1.2** Install Python dependencies
  ```powershell
  pip install -r requirements.txt
  ```
  ✅ Expected: All packages installed successfully

- [ ] **1.3** Setup database
  ```powershell
  python setup_db.py
  ```
  ✅ Expected output:
  ```
  ✓ Database setup completed successfully!
  ✓ pgvector extension enabled
  ✓ documents table created
  ```

- [ ] **1.4** Process PDFs (Takes 5-10 minutes)
  ```powershell
  python process_pdfs.py
  ```
  ✅ Expected output:
  ```
  Found 3 PDF files to process
  ...
  ✓ Successfully stored all chunks in database!
  ```

- [ ] **1.5** Test RAG system
  ```powershell
  python test_rag.py
  ```
  ✅ Expected: All tests pass

#### Part 2: Backend Setup

- [ ] **2.1** Open new terminal and navigate to server folder
  ```powershell
  cd server
  ```

- [ ] **2.2** Install Node.js dependencies
  ```powershell
  npm install
  ```
  ✅ Expected: All packages installed, including axios

#### Part 3: Frontend Setup

- [ ] **3.1** Open new terminal and navigate to client folder
  ```powershell
  cd client
  ```

- [ ] **3.2** Install React dependencies
  ```powershell
  npm install
  ```
  ✅ Expected: All packages installed

---

## 🎮 Starting the Application

### Option A: Automated Start (Recommended)

- [ ] **Step 1:** Run the start script
  ```powershell
  .\start-all.ps1
  ```
- [ ] **Step 2:** Three PowerShell windows should open
- [ ] **Step 3:** Wait for all services to start (30 seconds)

---

### Option B: Manual Start

- [ ] **Terminal 1:** Start RAG API
  ```powershell
  cd RAG
  python app.py
  ```
  ✅ Expected: `Uvicorn running on http://0.0.0.0:8000`

- [ ] **Terminal 2:** Start Backend
  ```powershell
  cd server
  node app.js
  ```
  ✅ Expected: `Server is running on port 3000`

- [ ] **Terminal 3:** Start Frontend
  ```powershell
  cd client
  npm run dev
  ```
  ✅ Expected: `Local: http://localhost:5173`

---

## 🧪 Verification Tests

### Test 1: Check All Services Running

- [ ] **RAG API Health Check**
  ```powershell
  curl http://localhost:8000/health
  ```
  ✅ Expected: `{"status":"healthy","database":"connected","documents_count":XXX}`

- [ ] **Backend Health Check**
  ```powershell
  curl http://localhost:3000/rag/health
  ```
  ✅ Expected: `{"success":true,"data":{...}}`

- [ ] **Frontend Check**
  - [ ] Open browser: http://localhost:5173
  ✅ Expected: Login page loads

### Test 2: Test RAG Query

- [ ] **Direct RAG Test**
  ```powershell
  curl -X POST http://localhost:8000/query -H "Content-Type: application/json" -d "{\"query\":\"How to report cybercrime?\"}"
  ```
  ✅ Expected: JSON response with answer and sources

### Test 3: Full System Test

- [ ] Open http://localhost:5173
- [ ] Click "Sign Up" or "Login"
- [ ] Enter credentials and login
- [ ] Verify dashboard loads
- [ ] Click "Start Chatting" button
- [ ] Chat window opens
- [ ] Type: "How do I report a cybercrime in India?"
- [ ] Press Enter or click Send
- [ ] Wait 3-6 seconds
- [ ] Verify you receive:
  - [ ] Detailed answer
  - [ ] Source citations with:
    - [ ] Document name
    - [ ] Page number
    - [ ] Relevance score

---

## 🎯 Success Indicators

### You'll know it's working when:

✅ **RAG API Terminal** shows:
```
INFO: Application startup complete
INFO: Uvicorn running on http://0.0.0.0:8000
```

✅ **Backend Terminal** shows:
```
Connected to MongoDB
Server is running on port 3000
```

✅ **Frontend Terminal** shows:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

✅ **Health check** returns document count > 0

✅ **Chat interface** returns answers with sources

---

## 🐛 Troubleshooting

### Problem: Python dependencies won't install
- [ ] Solution: Upgrade pip
  ```powershell
  python -m pip install --upgrade pip
  ```

### Problem: "pgvector extension not found"
- [ ] Solution: Run SQL manually in Supabase dashboard
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

### Problem: Port already in use
- [ ] Solution: Kill process
  ```powershell
  # Find process on port 8000
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
  
  # Repeat for ports 3000 and 5173 if needed
  ```

### Problem: Gemini API errors
- [ ] Solution: Verify API key in `RAG/.env`
- [ ] Check quota at: https://makersuite.google.com/app/apikey

### Problem: No documents in database
- [ ] Solution: Re-run PDF processing
  ```powershell
  cd RAG
  python process_pdfs.py
  ```

### Problem: Chat not responding
- [ ] Verify RAG API is running (Terminal 1)
- [ ] Check: http://localhost:8000/health
- [ ] Look for errors in RAG API terminal

---

## 📊 Expected Database Stats

After running `process_pdfs.py`:

- **Documents:** ~150-200 chunks
- **Each chunk:** ~1000 characters
- **Embeddings:** 768 dimensions each
- **Sources:** 3 PDF files

Verify by checking: http://localhost:8000/health

---

## 🎉 Final Verification

### Complete this checklist:

- [ ] All three terminals are running without errors
- [ ] http://localhost:5173 loads the frontend
- [ ] Can login/signup successfully
- [ ] Dashboard displays properly
- [ ] "Start Chatting" button works
- [ ] Chat window opens
- [ ] Can send messages
- [ ] Receive AI responses (3-6 seconds)
- [ ] Sources are displayed with answers
- [ ] Can close and reopen chat

---

## 📝 Sample Questions to Test

Try these questions in the chat:

1. "How do I report a cybercrime in India?"
2. "What is the IT Act 2000?"
3. "How to file a complaint on the National Cybercrime Portal?"
4. "What are the penalties for online fraud?"
5. "How to report cyberstalking?"

Each should return:
- ✅ Detailed answer
- ✅ 3-5 source citations
- ✅ Page numbers
- ✅ Relevance scores

---

## 🆘 Still Having Issues?

### Check the logs:

1. **RAG API logs** (Terminal 1)
   - Look for errors in red
   - Check API requests coming in

2. **Backend logs** (Terminal 2)
   - Check for connection errors
   - Verify proxy requests to RAG API

3. **Browser Console** (F12)
   - Look for network errors
   - Check API call responses

### Review documentation:

- 📖 [QUICK_START.md](QUICK_START.md) - Quick commands
- 📖 [SETUP_RAG.md](SETUP_RAG.md) - Detailed RAG setup
- 📖 [SETUP_MAIN.md](SETUP_MAIN.md) - Full project guide
- 📖 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - What was built

---

## ✅ Setup Complete!

When all checkboxes above are checked, your system is ready! 🎉

**Next steps:**
1. Start using the chat interface
2. Test with different questions
3. Monitor performance
4. Add more PDFs to knowledge base (optional)

---

**Happy Chatting! 🚀**
