const express = require('express');
const router = express.Router();
const { searchRedditPosts } = require('../services/redditService');
const authMiddleware = require('../middleware/auth');

router.get('/search', async (req, res) => {
  try {
    const { q, limit = 25 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const posts = await searchRedditPosts(q, limit);
    res.json({ posts });
    
  } catch (error) {
    console.error('Reddit route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;