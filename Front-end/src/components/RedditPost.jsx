import { Avatar, Box, Chip, Divider, Link, Typography } from '@mui/material';
import { format } from 'date-fns';

const DEFAULT_POST = {
  sentiment: 'neutral',
  confidence: 0.5,
  redditData: {
    author: 'unknown',
    subreddit: 'all',
    url: '',
    title: 'No title available',
    text: '',
    created_at: new Date().toISOString(),
    upvotes: 0
  }
};

export default function RedditPost({ post = {} }) {
  const safePost = {
    ...DEFAULT_POST,
    ...post,
    redditData: { ...DEFAULT_POST.redditData, ...(post.redditData || {}) }
  };

  const avatarOptions = [
    'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_0.png',
    'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png',
    'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_2.png'
  ];
  const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar
          src={randomAvatar}
          sx={{ width: 24, height: 24, mr: 1 }}
          onError={(e) => { e.target.src = avatarOptions[0]; }}
        />
        <Typography variant="caption" color="text.secondary">
          Posted by u/{safePost.redditData.author} in r/{safePost.redditData.subreddit}
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>
        <Link
          href={`https://reddit.com${safePost.redditData.url}`}
          target="_blank"
          rel="noopener"
          color="inherit"
        >
          {safePost.redditData.title}
        </Link>
      </Typography>

      {safePost.redditData.text && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {safePost.redditData.text.length > 300
            ? `${safePost.redditData.text.substring(0, 300)}...`
            : safePost.redditData.text}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip
          label={safePost.sentiment}
          color={
            safePost.sentiment === 'positive' ? 'success' :
            safePost.sentiment === 'negative' ? 'error' : 'info'
          }
          size="small"
        />
        <Typography variant="caption">
          Confidence: {(safePost.confidence * 100).toFixed(1)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(safePost.redditData.created_at), 'MMM d, yyyy h:mm a')}
        </Typography>
        <Chip
          label={`▲ ${safePost.redditData.upvotes}`}
          size="small"
          variant="outlined"
        />
      </Box>

      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}
