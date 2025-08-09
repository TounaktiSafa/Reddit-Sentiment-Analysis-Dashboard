const axios = require('axios');

exports.searchRedditPosts = async (query, limit = 25) => {
  try {
    const response = await axios.get(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    return response.data.data.children.map(post => ({
      id: post.data.id,
      title: post.data.title,
      text: post.data.selftext,
      author: post.data.author,
      created_at: new Date(post.data.created_utc * 1000),
      upvotes: post.data.ups,
      url: post.data.url,
      subreddit: post.data.subreddit
    }));
  } catch (error) {
    console.error('Reddit search error:', error);
    throw new Error('Failed to fetch Reddit posts');
  }
};