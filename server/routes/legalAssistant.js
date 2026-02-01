const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');

console.log('pdf-parse loaded:', typeof pdfParse);

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

console.log('Legal Assistant Routes loaded, API Key:', process.env.GROQ_API_KEY ? 'Present ✓' : 'Missing ✗');

// Configure multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// In-memory storage for user data (replace with MongoDB in production)
const userDataStore = new Map();

// Legal Assistant System Prompt
const LEGAL_ASSISTANT_PROMPT = `You are an expert Legal AI Assistant for professional lawyers and advocates. You specialize in:

1. **Legal Research & Analysis**: Provide comprehensive legal research with proper citations and case law references
2. **Document Drafting**: Generate professional legal documents including petitions, notices, contracts, and applications
3. **Case Summary**: Summarize lengthy judgments and legal documents into concise, actionable summaries
4. **Section Cross-Linking**: Identify and explain related legal provisions and their interconnections
5. **Argument Building**: Develop strong legal arguments both for and against positions
6. **Legal Language**: Rewrite content in formal, professional legal language

**Response Guidelines:**
- Always cite relevant sections, acts, and case law when applicable
- Structure responses with clear headings using **bold** for emphasis
- Provide practical, actionable advice
- Use formal legal terminology appropriately
- When analyzing cases or documents, provide:
  * Key facts
  * Legal issues
  * Relevant provisions
  * Arguments
  * Precedents
  * Recommendations

Be comprehensive, professional, and precise in all responses.`;

// Extract text from PDF
router.post('/extract-pdf', upload.single('pdf'), async (req, res) => {
  try {
    console.log('PDF upload request received');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size, 'Type:', req.file.mimetype);
    console.log('Starting PDF parsing...');
    console.log('Calling pdfParse function, type:', typeof pdfParse);
    
    // Parse PDF using pdfParse as a function
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    
    console.log('PDF parsed successfully. Pages:', pdfData.numpages, 'Text length:', pdfData.text.length);
    
    // Limit text to prevent response size issues (keep first 50000 characters)
    const extractedText = pdfData.text.length > 50000 
      ? pdfData.text.substring(0, 50000) + '\n\n[...Text truncated due to length...]'
      : pdfData.text;
    
    console.log('Sending response...');
    
    const response = {
      success: true,
      text: extractedText,
      pageCount: pdfData.numpages,
      totalLength: pdfData.text.length,
      truncated: pdfData.text.length > 50000
    };
    
    res.json(response);
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Error extracting PDF:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to extract PDF content. The file may be corrupted or password-protected.',
      error: error.message 
    });
  }
});

// Chat with AI
router.post('/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Build conversation context with system prompt
    let systemPrompt = LEGAL_ASSISTANT_PROMPT;
    
    // Build conversation history
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent chat history for context
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.slice(-5).forEach(msg => {
        if (msg.type === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.type === 'bot') {
          messages.push({ role: 'assistant', content: msg.content });
        }
      });
    }

    // Add current message (which already includes PDF content if available)
    messages.push({ role: 'user', content: message });

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2048,
      top_p: 0.9
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    
    // Calculate confidence based on response quality
    const confidence = response.length > 200 ? 95 : response.length > 100 ? 85 : 75;

    res.json({
      success: true,
      response: response,
      confidence: confidence
    });

  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process chat request',
      error: error.message 
    });
  }
});

// Save user data
router.post('/data', async (req, res) => {
  try {
    const { userId, chatHistory, quickNotes } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    userDataStore.set(userId, {
      chatHistory: chatHistory || [],
      quickNotes: quickNotes || [],
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ success: false, message: 'Failed to save data' });
  }
});

// Get user data
router.get('/data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userData = userDataStore.get(userId) || {
      chatHistory: [],
      quickNotes: []
    };

    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).json({ success: false, message: 'Failed to load data' });
  }
});

module.exports = router;
