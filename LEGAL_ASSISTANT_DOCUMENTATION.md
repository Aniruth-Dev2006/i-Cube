# Legal AI Assistant - Professional Suite

## Overview
A comprehensive AI-powered legal assistant designed specifically for lawyers and advocates. This tool provides intelligent legal research, document drafting, case analysis, and PDF processing capabilities.

## Features

### 1. **AI-Powered Legal Chat**
- Real-time legal consultation powered by Groq's llama-3.3-70b-versatile model
- Context-aware responses with legal citations and case law
- Confidence scoring for AI responses
- Chat history persistence

### 2. **PDF Document Processing**
- Upload legal documents (up to 10MB)
- Automatic text extraction from PDFs
- Ask questions about uploaded documents
- Context-aware analysis of legal documents

### 3. **Professional Tools Integration**
All tools redirect to the AI assistant for seamless interaction:

#### **Section Cross-Linking**
- Find related legal provisions
- Automatic cross-reference generation
- Multi-jurisdictional support

#### **Case Summary Tool**
- Generate 1-page summaries of lengthy judgments
- Extract key facts, issues, and holdings
- Identify relevant precedents

#### **Draft Templates**
- Generate petitions, notices, and applications
- Customizable templates for various legal scenarios
- Professional formatting

#### **Argument Builder**
- Generate arguments for and against legal positions
- Case law support
- Counter-argument analysis

#### **Legal Language Rewriter**
- Transform informal text into formal legal language
- Maintain legal precision
- Professional tone enhancement

### 4. **Quick Notes System**
- Create, edit, and delete quick access notes
- Categorize important information
- Persistent storage across sessions
- Searchable note database

### 5. **Export & Download**
- Export chat conversations as text files
- Download generated documents
- Maintain conversation history

## Technical Implementation

### Frontend Components
**File:** `client/src/components/LegalAssistant.jsx`

**Key Features:**
- React Hooks for state management
- Real-time chat interface with Groq AI
- PDF upload and processing
- Notes CRUD operations
- Tab-based navigation (Chat / Notes)
- Markdown text formatting with **bold** support
- Responsive design with dark mode

**Dependencies:**
- axios - HTTP requests
- lucide-react - Icons
- React Router - Navigation

### Backend API
**File:** `server/routes/legalAssistant.js`

**Endpoints:**

#### 1. POST `/api/legal-assistant/extract-pdf`
Extract text from uploaded PDF documents.

**Request:**
- `multipart/form-data` with PDF file
- Max file size: 10MB

**Response:**
```json
{
  "success": true,
  "text": "Extracted PDF content...",
  "pageCount": 25,
  "info": {...}
}
```

#### 2. POST `/api/legal-assistant/chat`
Send messages to AI assistant.

**Request:**
```json
{
  "message": "User's legal query",
  "pdfContext": "Optional PDF text content",
  "chatHistory": [...]
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI assistant's response",
  "confidence": 95
}
```

#### 3. POST `/api/legal-assistant/data`
Save user data (chat history and notes).

**Request:**
```json
{
  "userId": "user123",
  "chatHistory": [...],
  "quickNotes": [...]
}
```

#### 4. GET `/api/legal-assistant/data/:userId`
Retrieve user's saved data.

**Response:**
```json
{
  "success": true,
  "data": {
    "chatHistory": [...],
    "quickNotes": [...]
  }
}
```

### AI Configuration
**Model:** Groq llama-3.3-70b-versatile

**Parameters:**
- Temperature: 0.3 (for consistent, factual responses)
- Max Tokens: 2048
- Top P: 0.9

**System Prompt:**
The AI is configured as an expert legal assistant specializing in:
- Legal research with citations
- Document drafting
- Case analysis
- Argument building
- Legal language formatting

## Installation & Setup

### 1. Install Dependencies
```bash
cd server
npm install groq-sdk pdf-parse multer
```

### 2. Environment Variables
Add to `server/.env`:
```env
GROQ_API_KEY=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
```

### 3. Register Routes
File: `server/app.js`
```javascript
const legalAssistantRoutes = require('./routes/legalAssistant');
app.use('/api/legal-assistant', legalAssistantRoutes);
```

### 4. Add Frontend Route
File: `client/src/App.jsx`
```javascript
import LegalAssistant from './components/LegalAssistant';
<Route path="/legal-assistant" element={<LegalAssistant />} />
```

### 5. Start Application
```bash
# Terminal 1 - Backend
cd server
node app.js

# Terminal 2 - Frontend
cd client
npm run dev
```

## Usage Guide

### For Lawyers

#### 1. Accessing the Assistant
- Navigate to `/lawyer-tools` dashboard
- Click any professional tool or "Open AI Assistant"
- Or directly visit `/legal-assistant`

#### 2. Using Professional Tools
- **Case Summary:** Click tool → Enter judgment details in chat
- **Draft Templates:** Click tool → Specify document type and details
- **Argument Builder:** Click tool → Provide case facts and position
- **Section Cross-Linking:** Click tool → Enter section reference
- **Legal Language Rewriter:** Click tool → Paste informal text

#### 3. PDF Analysis
- Click "Upload PDF" button
- Select legal document (max 10MB)
- Wait for extraction
- Ask questions about the document

#### 4. Managing Notes
- Switch to "Quick Notes" tab
- Click "New Note" to create
- Edit or delete existing notes
- Notes save automatically

#### 5. Exporting Data
- Click "Export" button in chat header
- Downloads conversation as text file
- Includes timestamps and full dialogue

## Removed Features

### Recent Activity Section
**Reason:** Redundant with chat history and notes system

**Previous Location:** LawyerTools.jsx - Right column

**Replacement:** All activity now tracked in Legal Assistant with better persistence and searchability

### Static Popular Templates
**Previous Behavior:** Static buttons with no functionality

**New Behavior:** Click redirects to AI assistant where templates are generated dynamically based on user needs

## API Key Security

⚠️ **Important:** The Groq API key is currently hardcoded in the backend. For production:

1. Move to environment variables only
2. Never commit API keys to version control
3. Use secrets management (AWS Secrets Manager, Azure Key Vault)
4. Implement rate limiting
5. Add API key rotation

## Data Persistence

**Current:** In-memory storage using Map
**Recommended:** Migrate to MongoDB collection

### Migration to MongoDB
```javascript
// server/models/LegalAssistantData.js
const mongoose = require('mongoose');

const LegalAssistantDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  chatHistory: [{
    type: { type: String, enum: ['user', 'bot', 'system'] },
    content: String,
    confidence: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  quickNotes: [{
    id: Number,
    title: String,
    content: String,
    createdAt: Date,
    updatedAt: Date
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LegalAssistantData', LegalAssistantDataSchema);
```

## Performance Optimization

### Current Limitations
- In-memory storage clears on server restart
- No pagination for large chat histories
- PDF processing limited to 10MB

### Recommended Improvements
1. **Implement pagination** for chat history
2. **Add caching** for frequently requested legal information
3. **Use background jobs** for large PDF processing
4. **Add rate limiting** to prevent API abuse
5. **Implement WebSocket** for real-time chat

## Future Enhancements

### Planned Features
1. **Voice Input:** Speech-to-text for dictation
2. **Multi-language Support:** Hindi, Tamil, Telugu legal queries
3. **Precedent Database:** Integrated case law search
4. **Collaborative Notes:** Share notes with team members
5. **Calendar Integration:** Link with court date management
6. **Document Comparison:** Compare multiple legal documents
7. **Citation Checker:** Verify case law citations
8. **Legal Forms Library:** Pre-filled court forms

### Integration Opportunities
- **RAG System:** Connect with existing knowledge base
- **E-Filing:** Direct court submission
- **Case Management:** Link with practice management software
- **Billing:** Track time spent on research

## Troubleshooting

### Common Issues

#### 1. PDF Upload Fails
**Solution:** Check file size (<10MB) and format (PDF only)

#### 2. AI Response Timeout
**Solution:** Check Groq API key validity and network connection

#### 3. Data Not Saving
**Solution:** Verify user authentication and MongoDB connection

#### 4. Chat Not Loading
**Solution:** Check browser console for errors, verify backend is running

## Support & Maintenance

### Monitoring
- Log all API calls and errors
- Track response times
- Monitor API usage and costs

### Regular Updates
- Keep Groq SDK updated
- Review and update system prompts
- Add new legal domains as needed

## License & Attribution
- Groq AI: llama-3.3-70b-versatile model
- PDF Parse: MIT License
- Lucide React: ISC License

---

**Version:** 1.0.0  
**Last Updated:** February 1, 2026  
**Maintained By:** Development Team
