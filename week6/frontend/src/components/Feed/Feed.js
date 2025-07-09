import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Box, Card, CardMedia, CardContent, Typography, CircularProgress } from '@mui/material';

export default function Feed({posts}) {
// const [posts, setPosts] = useState(null);

//   useEffect(() => {
//     axios.get('/posts/mine')
//       .then(res => setPosts(res.data))
//       .catch(() => setPosts([]));
//   }, []);

  if (!posts) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;


  return (
    <Box sx={{ p: 4 }}>
      {posts?.map(post => (
        <Card key={post._id} sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          <CardMedia
            component="img"
            height="300"
            image={post.imageUrl}
            alt={post.caption}
          />
          <CardContent>
            <Typography variant="body1">{post.caption}</Typography>
            <Typography variant="caption" color="text.secondary">
              by {post.user?.username || 'Unknown'}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}