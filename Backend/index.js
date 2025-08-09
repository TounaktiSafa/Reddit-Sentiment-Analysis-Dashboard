const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const redditRoutes = require('./routes/reddit');
const axios = require('axios'); 
const authMiddleware = require('./middleware/auth'); // Add this
require('dotenv').config();
const User = require('./models/User'); 
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sentiment-db')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Routes
app.get('/', (req, res) => res.send('API is running'));

app.use('/api/reddit', redditRoutes);


// Protected routes
// In your backend (index.js or routes file)
app.post('/api/analyze', authMiddleware, async (req, res) => {
  try {
    // Verify input
    if (!req.body.text) {
      return res.status(400).json({ error: "Text parameter is required" });
    }

    // Call Python API
    const response = await axios.post('http://localhost:6000/predict', {
      texts: [req.body.text]
    });

    // Save to database
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        analyses: {
          text: req.body.text,
          sentiment: response.data.results[0].sentiment,
          confidence: response.data.results[0].confidence,
          date: new Date()
        }
      }
    });

    res.json(response.data.results[0]);
    
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ 
      error: "Analysis failed",
      details: err.message
    });
  }
});

app.get('/api/history', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('analyses');
        res.send(user.analyses);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);









const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));