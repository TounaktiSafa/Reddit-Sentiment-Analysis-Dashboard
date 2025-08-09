import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

export default function WordCloud({ analyses = [] }) {
  const words = React.useMemo(() => {
    try {
      if (!Array.isArray(analyses) || analyses.length === 0) return [];
      
      const wordCount = analyses.reduce((acc, analysis) => {
        if (!analysis?.text) return acc;
        
        const cleanedText = analysis.text
          .toLowerCase()
          .replace(/[^a-z\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3)
          .filter(word => !['this', 'that', 'with', 'from', 'they', 'been', 'have', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'can', 'still', 'should', 'after', 'being', 'now', 'made', 'before', 'here', 'through', 'when', 'where', 'much', 'some', 'these', 'many', 'then', 'them', 'well', 'were'].includes(word));

        cleanedText.forEach(word => {
          acc[word] = (acc[word] || 0) + 1;
        });
        
        return acc;
      }, {});

      return Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([text, value]) => ({ text, value }));
    } catch (error) {
      console.error('Error generating word frequencies:', error);
      return [];
    }
  }, [analyses]);

  if (!words || words.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography color="text.secondary">
          No text data available for word analysis
        </Typography>
      </Box>
    );
  }

  const maxFreq = Math.max(...words.map(w => w.value));

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Most Frequent Words (Top {words.length})
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1,
        justifyContent: 'center',
        minHeight: 200
      }}>
        {words.map(({ text, value }) => {
          const fontSize = Math.max(12, Math.min(24, (value / maxFreq) * 20 + 12));
          const color = value > maxFreq * 0.7 ? 'primary' : 
                       value > maxFreq * 0.4 ? 'secondary' : 'default';
          
          return (
            <Chip
              key={text}
              label={`${text} (${value})`}
              variant={value > maxFreq * 0.5 ? 'filled' : 'outlined'}
              color={color}
              sx={{
                fontSize: `${fontSize}px`,
                height: 'auto',
                '& .MuiChip-label': {
                  padding: '8px 12px',
                  fontSize: 'inherit'
                }
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}