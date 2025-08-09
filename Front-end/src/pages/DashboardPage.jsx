// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Chip,
  Grid,
  Paper
} from '@mui/material';
import RedditAnalysis from '../components/RedditAnalysis';
import RedditPost from '../components/RedditPost';
import SentimentTimeline from '../components/Dashboard/SentimentTimeline';
import WordCloud from '../components/Dashboard/WordCloud';
import api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await api.get('/api/history');
        // Ensure we have an array and valid data structure
        const validHistory = Array.isArray(data) ? data.filter(item => 
          item && typeof item === 'object' && item.text
        ) : [];
        setHistory(validHistory);
      } catch (err) {
        console.error('Error loading history:', err);
        setError('Failed to load history');
        setHistory([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleNewAnalysis = (results) => {
    if (Array.isArray(results) && results.length > 0) {
      // Add new results to the beginning of history
      setHistory(prev => [...results, ...prev]);
      
      // Show success message
      setError('');
    }
  };

  // Filter different types of analyses
  const redditPosts = history.filter(item => item?.redditData);
  const textAnalyses = history.filter(item => item?.text && !item?.redditData);

  // Calculate overall sentiment distribution
  const sentimentStats = history.reduce((acc, item) => {
    const sentiment = item?.sentiment || 'neutral';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    acc.total++;
    return acc;
  }, { positive: 0, negative: 0, neutral: 0, total: 0 });

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Social Media Sentiment Dashboard
      </Typography>
      
      {sentimentStats.total > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Overall Statistics</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {((sentimentStats.positive / sentimentStats.total) * 100).toFixed(1)}%
                </Typography>
                <Typography>Positive ({sentimentStats.positive})</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="error.main">
                  {((sentimentStats.negative / sentimentStats.total) * 100).toFixed(1)}%
                </Typography>
                <Typography>Negative ({sentimentStats.negative})</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  {((sentimentStats.neutral / sentimentStats.total) * 100).toFixed(1)}%
                </Typography>
                <Typography>Neutral ({sentimentStats.neutral})</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)} 
        sx={{ mb: 3 }}
      >
        <Tab label="Reddit Analysis" />
        <Tab label="Visualizations" />
        <Tab label="Analysis History" />
      </Tabs>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {tabValue === 0 && (
        <>
          <RedditAnalysis onAnalysisComplete={handleNewAnalysis} />
          
          {redditPosts.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Latest Reddit Analysis Results ({redditPosts.length} total)
                </Typography>
                {redditPosts.slice(0, 5).map((post, index) => (
                  <RedditPost key={`recent-${index}`} post={post} />
                ))}
                {redditPosts.length > 5 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    ... and {redditPosts.length - 5} more posts. View all in Analysis History tab.
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {tabValue === 1 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sentiment Over Time
              </Typography>
              {history.length > 0 ? (
                <SentimentTimeline data={history} />
              ) : (
                <Typography color="text.secondary">
                  No data available. Run some analyses first.
                </Typography>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <WordCloud analyses={history.filter(item => item?.text && item.text.length > 0)} />
            </CardContent>
          </Card>
        </Box>
      )}
      
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analysis History ({history.length} total)
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : history.length === 0 ? (
              <Alert severity="info">
                No analyses yet. Go to the Reddit Analysis tab to search for a product and analyze comments.
              </Alert>
            ) : (
              <Box>
                {/* Show Reddit posts */}
                {redditPosts.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Reddit Posts ({redditPosts.length})
                    </Typography>
                    {redditPosts.map((post, index) => (
                      <RedditPost key={`history-reddit-${index}`} post={post} />
                    ))}
                  </Box>
                )}

                {/* Show text analyses */}
                {textAnalyses.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Text Analyses ({textAnalyses.length})
                    </Typography>
                    {textAnalyses.map((item, index) => (
                      <Box key={`history-text-${index}`} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Typography sx={{ mb: 1 }}>
                          <strong>Text:</strong> {item.text?.substring(0, 200)}
                          {item.text?.length > 200 ? '...' : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip 
                            label={item.sentiment || 'neutral'} 
                            color={
                              item.sentiment === 'positive' ? 'success' : 
                              item.sentiment === 'negative' ? 'error' : 'info'
                            } 
                            size="small"
                          />
                          <Typography variant="caption">
                            Confidence: {((item.confidence || 0) * 100).toFixed(1)}%
                          </Typography>
                          {item.date && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(item.date).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}