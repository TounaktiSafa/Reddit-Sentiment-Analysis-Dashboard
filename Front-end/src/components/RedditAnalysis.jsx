import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent 
} from '@mui/material';
import { fetchRedditPosts } from '../services/redditService';
import api from '../services/api';
import RedditPost from './RedditPost';

export default function RedditAnalysis({ onAnalysisComplete }) {
  const [productName, setProductName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!productName.trim()) {
      setError('Please enter a product name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResults([]);
      
      // 1. Fetch Reddit posts
      console.log('Fetching Reddit posts for:', productName);
      const posts = await fetchRedditPosts({
        query: productName,
        limit: 25
      });

      if (!Array.isArray(posts) || posts.length === 0) {
        setError('No posts found for this search. Try a different product name.');
        setLoading(false);
        return;
      }

      console.log('Found', posts.length, 'posts');
      
      // 2. Analyze each post
      const analysisResults = [];
      
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        try {
          const textToAnalyze = `${post.title || ''} ${post.text || ''}`.trim();
          
          if (textToAnalyze.length < 10) {
            continue; // Skip posts with too little text
          }

          const response = await api.post('/api/analyze', {
            text: textToAnalyze
          });

          const analysisResult = {
            id: post.id,
            text: textToAnalyze,
            sentiment: response.data.sentiment,
            confidence: response.data.confidence,
            date: new Date().toISOString(),
            redditData: {
              author: post.author,
              subreddit: post.subreddit,
              url: post.url,
              title: post.title,
              text: post.text,
              created_at: post.created_at,
              upvotes: post.upvotes
            }
          };

          analysisResults.push(analysisResult);
          
          // Update results incrementally
          setResults([...analysisResults]);
          
        } catch (error) {
          console.error('Error analyzing post:', post.id, error);
          // Continue with other posts even if one fails
        }
      }
      
      if (analysisResults.length === 0) {
        setError('No posts could be analyzed. Try a different search term.');
        return;
      }

      console.log('Analysis complete:', analysisResults.length, 'posts analyzed');
      
      // 3. Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResults);
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error.message || 'Failed to complete analysis');
    } finally {
      setLoading(false);
    }
  };

  const sentimentCounts = results.reduce((acc, result) => {
    acc[result.sentiment] = (acc[result.sentiment] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Analyze Reddit Comments
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., iPhone 15, PlayStation 5, Tesla Model 3"
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !productName.trim()}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Analyze'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && results.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Analyzing posts... {results.length} completed
          </Alert>
        )}

        {results.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Analysis Summary ({results.length} posts)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {Object.entries(sentimentCounts).map(([sentiment, count]) => (
                <Typography 
                  key={sentiment}
                  variant="body2" 
                  sx={{ 
                    color: sentiment === 'positive' ? 'success.main' :
                           sentiment === 'negative' ? 'error.main' : 'info.main'
                  }}
                >
                  {sentiment}: {count} ({((count / results.length) * 100).toFixed(1)}%)
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {results.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Recent Results (showing first 5):
            </Typography>
            {results.slice(0, 5).map((post, index) => (
              <RedditPost key={`analysis-${index}`} post={post} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}