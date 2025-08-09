// Dashboard/SentimentTimeline.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function SentimentTimeline({ data = [] }) {
  const processData = () => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const dailyData = data.reduce((acc, item) => {
      // Vérification plus stricte
      if (!item || typeof item !== 'object' || !item.date || !item.sentiment) return acc;

      const dateStr = new Date(item.date).toLocaleDateString();
      const sentiment = item.sentiment.toLowerCase();

      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, positive: 0, negative: 0, neutral: 0, total: 0 };
      }

      if (acc[dateStr].hasOwnProperty(sentiment)) {
        acc[dateStr][sentiment]++;
      }
      acc[dateStr].total++;

      return acc;
    }, {});

    return Object.values(dailyData).map(day => ({
      date: day.date,
      positive: day.total > 0 ? Math.round((day.positive / day.total) * 100) : 0,
      negative: day.total > 0 ? Math.round((day.negative / day.total) * 100) : 0,
      neutral: day.total > 0 ? Math.round((day.neutral / day.total) * 100) : 0
    }));
  };

  const chartData = processData();

  if (!chartData || chartData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography>No valid data available for timeline</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <Tooltip formatter={(value) => [`${value}%`]} contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 4 }} />
        <Legend />
        <Line type="monotone" dataKey="positive" stroke="#4CAF50" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="negative" stroke="#F44336" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="neutral" stroke="#9E9E9E" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}