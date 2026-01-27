const express = require('express');
const router = express.Router();
const axios = require('axios');

const RAG_API_URL = process.env.RAG_API_URL || 'http://localhost:8000';

// Query RAG system
router.post('/query', async (req, res) => {
  try {
    const { query, max_results, conversation_history } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Query is required' 
      });
    }

    // Call RAG API with conversation history
    const response = await axios.post(`${RAG_API_URL}/query`, {
      query: query.trim(),
      max_results: max_results || 5,
      conversation_history: conversation_history || []
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('RAG query error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.detail || 'RAG service error'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to query knowledge base. Make sure RAG service is running.'
    });
  }
});

// Health check for RAG service
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${RAG_API_URL}/health`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'RAG service is not available'
    });
  }
});

module.exports = router;
