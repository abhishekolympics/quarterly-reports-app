const express = require('express');
const geminiService = require('../services/geminiService');

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('[Gemini Route] Generating content with prompt length:', prompt.length);
    
    const content = await geminiService.generateContent(prompt);
    
    res.json({ content });
  } catch (error) {
    console.error('[Gemini Route] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;