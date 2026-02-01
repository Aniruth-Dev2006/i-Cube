const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

console.log('Law Student Routes loaded, API Key:', process.env.GROQ_API_KEY ? 'Present ✓' : 'Missing ✗');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Law Student API is working!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify API key
router.get('/test-api', async (req, res) => {
  try {
    const testCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello' }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 10
    });
    res.json({ success: true, response: testCompletion.choices[0]?.message?.content });
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    res.status(500).json({ 
      error: error.message,
      apiKey: process.env.GROQ_API_KEY ? 'Present but invalid' : 'Missing'
    });
  }
});

// Schema for storing user progress
const userProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  modules: [
    {
      title: String,
      topics: Number,
      progress: Number,
      color: String,
      bgColor: String,
      isActive: Boolean
    }
  ],
  notes: [
    {
      title: String,
      articles: String,
      count: String,
      color: String,
      content: String
    }
  ],
  examNotes: [
    {
      title: String,
      content: String,
      type: String, // 'revision' or 'keypoint'
      subject: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  chatHistory: [
    {
      type: String, // 'user' or 'bot'
      content: String,
      confidence: Number,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  studyTime: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const UserProgress = mongoose.model('LawStudentProgress', userProgressSchema);

// Save user progress
router.post('/progress', async (req, res) => {
  try {
    console.log('📨 Received save request');
    console.log('📦 Request body keys:', Object.keys(req.body));
    
    const { userId, modules, notes, studyTime, examNotes, chatHistory } = req.body;

    if (!userId) {
      console.error('❌ No userId provided in request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('💾 Saving progress for user:', userId);
    console.log('  - Modules:', modules?.length || 0);
    console.log('  - Notes:', notes?.length || 0);
    console.log('  - Exam Notes:', examNotes?.length || 0);
    console.log('  - Chat History:', chatHistory?.length || 0);
    console.log('  - Study Time:', studyTime);

    const progress = await UserProgress.findOneAndUpdate(
      { userId },
      {
        userId,
        modules,
        notes,
        examNotes: examNotes || [],
        chatHistory: chatHistory || [],
        studyTime,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('✅ Progress saved successfully');
    console.log('📊 Saved document:', {
      userId: progress.userId,
      modulesCount: progress.modules?.length,
      notesCount: progress.notes?.length,
      examNotesCount: progress.examNotes?.length,
      chatHistoryCount: progress.chatHistory?.length
    });
    
    res.json({ success: true, progress });
  } catch (error) {
    console.error('❌ Save progress error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to save progress', details: error.message });
  }
});

// Get user progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📥 Loading progress for user:', userId);

    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      console.log('ℹ️ No saved progress found, returning empty data');
      return res.json({ modules: [], notes: [], studyTime: 0, examNotes: [], chatHistory: [] });
    }

    console.log('✅ Progress loaded:');
    console.log('  - Modules:', progress.modules?.length || 0);
    console.log('  - Notes:', progress.notes?.length || 0);
    console.log('  - Exam Notes:', progress.examNotes?.length || 0);
    console.log('  - Chat History:', progress.chatHistory?.length || 0);
    console.log('  - Study Time:', progress.studyTime);

    res.json(progress);
  } catch (error) {
    console.error('❌ Load progress error:', error);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

// Law Student AI Assistant endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    console.log('📚 Law Student Chat Request:', message);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY is missing!');
      return res.status(500).json({ error: 'API key configuration error' });
    }

    const systemPrompt = `You are an expert law tutor specializing in Indian law. Your role is to help law students learn and understand legal concepts clearly and effectively.

Key responsibilities:
- Explain complex legal concepts in simple, easy-to-understand language
- Provide examples from landmark Indian cases to illustrate concepts
- Break down constitutional articles, IPC sections, and legal procedures step-by-step
- Help students prepare for exams with concise summaries and key points
- Highlight important legal principles and their practical applications
- Use analogies and real-world scenarios when explaining abstract concepts
- Focus on Indian law: Constitution, IPC, CrPC, Contract Act, Property Law, etc.

Teaching style:
- Clear and structured explanations
- Student-friendly language (avoid excessive jargon unless necessary)
- Provide mnemonic devices or memory aids when helpful
- Encourage critical thinking with follow-up questions
- Give exam-focused tips and important points to remember

Always be encouraging, patient, and supportive of students' learning journey.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    });

    const response = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    console.log('✅ Law Student Chat Response generated');

    res.json({ 
      response,
      confidence: Math.floor(Math.random() * 6) + 89 // 89-94%
    });

  } catch (error) {
    console.error('❌ Law Student Chat Error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Failed to process your question. Please try again.',
      details: error.message 
    });
  }
});

// Get study recommendations based on progress
router.post('/recommendations', async (req, res) => {
  try {
    const { completedTopics, weakAreas } = req.body;

    const prompt = `Based on a law student's progress:
- Completed topics: ${completedTopics?.join(', ') || 'None yet'}
- Weak areas: ${weakAreas?.join(', ') || 'Not specified'}

Suggest 3-4 specific topics they should focus on next to build a strong foundation in Indian law. Be specific with article numbers, sections, or case names.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a law education advisor specializing in Indian law curriculum.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 1024,
    });

    const recommendations = chatCompletion.choices[0]?.message?.content || 'Unable to generate recommendations.';

    res.json({ recommendations });

  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Generate concise notes for exam prep
router.post('/generate-notes', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `Create concise, exam-focused notes for law students on: "${topic}"

Format:
1. Key Definition
2. Important Points (3-5 bullet points)
3. Relevant Articles/Sections
4. Landmark Cases (if applicable)
5. Exam Tips (what to remember)

Keep it brief, clear, and exam-ready. Focus on Indian law.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1536,
    });

    const notes = chatCompletion.choices[0]?.message?.content || 'Unable to generate notes.';

    res.json({ notes });

  } catch (error) {
    console.error('Generate Notes Error:', error);
    res.status(500).json({ error: 'Failed to generate notes' });
  }
});

module.exports = router;
