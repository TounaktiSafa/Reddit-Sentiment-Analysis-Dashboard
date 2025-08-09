import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, Typography, Box, CircularProgress, Alert,
  Card, CardContent, TextField, Button, Tabs, Tab
} from '@mui/material';
import { fetchTweets, analyzeTweets } from '../services/twitterService';
import SentimentTimeline from '../components/SentimentTimeline';
import WordCloud from '../components/WordCloud';
import api from '../services/api';

export default function EnhancedDashboard() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await api.get('/api/history');
        setHistory(data);
      } catch (err) {
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleProductAnalysis = async () => {
    if (!productQuery.trim()) return;
    
    setAnalyzing(true);
    try {
      const tweets = await fetchTweets(productQuery);
      const results = await analyzeTweets(tweets);
      setHistory([...results, ...history]);
    } catch (err) {
      setError('Product analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Social Media Sentiment Dashboard
      </Typography>
      
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Single Analysis" />
        <Tab label="Product Analysis" />
        <Tab label="Visualizations" />
      </Tabs>
      
      {tabValue === 0 && (
        <Card sx={{ my: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Analyze Text</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter text to analyze..."
            />
            <Button variant="contained" sx={{ mt: 2 }}>Analyze</Button>
          </CardContent>
        </Card>
      )}
      
      {tabValue === 1 && (
        <Card sx={{ my: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Analyze Product Mentions</Typography>
            <TextField
              fullWidth
              label="Product Name"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={handleProductAnalysis}
              disabled={analyzing}
            >
              {analyzing ? <CircularProgress size={24} /> : 'Analyze Social Media'}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {tabValue === 2 && (
        <Box sx={{ my: 3 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Sentiment Over Time</Typography>
              <SentimentTimeline data={history} />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Frequent Terms</Typography>
              <WordCloud analyses={history} />
            </CardContent>
          </Card>
        </Box>
      )}
      
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      
      <Card sx={{ my: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Analysis History</Typography>
          {history.length > 0 ? (
            <Box>
              {history.slice(0, 10).map((item, i) => (
                <Box key={i} sx={{ mb: 2, p: 2, borderBottom: '1px solid #eee' }}>
                  <Typography><strong>Text:</strong> {item.text}</Typography>
                  <Typography>
                    <strong>Sentiment:</strong> 
                    <span style={{ 
                      color: item.sentiment === 'positive' ? 'green' : 
                            item.sentiment === 'negative' ? 'red' : 'gray',
                      marginLeft: '8px'
                    }}>
                      {item.sentiment} ({(item.confidence * 100).toFixed(1)}%)
                    </span>
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography>No analyses yet</Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}