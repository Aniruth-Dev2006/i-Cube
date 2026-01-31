const express = require('express');
const router = express.Router();
const axios = require('axios');

// N8N webhook endpoint
const N8N_WEBHOOK_URL = 'https://aniruthpvt.app.n8n.cloud/webhook/92321f9b-13b4-4f13-ab86-ed9d37b22970';

// Submit cyber complaint
router.post('/submit-complaint', async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Send to N8N webhook
    const response = await axios.post(N8N_WEBHOOK_URL, {
      subject,
      message
    });

    if (response.data.success) {
      res.json({
        success: true,
        message: 'Mail sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send complaint'
      });
    }
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting complaint',
      error: error.message
    });
  }
});

module.exports = router;
