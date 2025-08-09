// src/services/redditService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Existing function
export const fetchRedditPosts = async ({ query, limit, subreddit }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/reddit/search`, {
      params: {
        q: query,
        limit,
        subreddit
      }
    });
    
    // Ensure we're returning an array
    return Array.isArray(response.data?.posts) ? response.data.posts : [];
  } catch (error) {
    console.error('Reddit fetch error:', error);
    throw error;
  }
};

// New function to analyze posts
export const analyzePosts = (posts) => {
  return posts.map(post => {
    // Simple sentiment analysis example
    const text = `${post.title} ${post.text || ''}`.toLowerCase();
    let sentiment = 'neutral';
    let confidence = 0.5;
    
    const positiveWords = ['happy', 'great', 'awesome', 'love', 'good'];
    const negativeWords = ['sad', 'bad', 'hate', 'terrible', 'awful'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = 0.5 + (positiveCount * 0.1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = 0.5 + (negativeCount * 0.1);
    }
    
    return {
      ...post,
      sentiment,
      confidence: Math.min(confidence, 0.99) // Cap at 0.99
    };
  });
};