import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Box, Card, CardMedia, CardContent, Typography, CircularProgress, IconButton, Badge, Avatar, Modal, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUserFromToken } from '../../utils/auth';

export default function Feed({ posts }) {
  const [likeModalOpen, setLikeModalOpen] = useState(false);
  const [likeUsers, setLikeUsers] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [liking, setLiking] = useState({}); // { [postId]: boolean }

  const handleLike = async (postId) => {
    setLiking(l => ({ ...l, [postId]: true }));
    await axios.post(`/posts/${postId}/like`);
    setLiking(l => ({ ...l, [postId]: false }));
    window.location.reload();
  };
  const user = getUserFromToken();
  const currentUserId = user?.id;

  const handleShowLikes = async (postId) => {
    setSelectedPostId(postId);
    const res = await axios.get(`/posts/${postId}/likes`);
    setLikeUsers(res.data.users);
    setLikeModalOpen(true);
  };

  if (!posts) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      {posts.length === 0 && <Typography variant="h6" color="text.secondary" align="center">No posts yet</Typography>}
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
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <motion.div
                whileTap={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <IconButton
                  color={post.likes?.includes(currentUserId) ? 'error' : 'default'}
                  onClick={() => handleLike(post._id)}
                  disabled={liking[post._id]}
                >
                  <FavoriteIcon sx={{ color: post.likes?.length > 0 ? 'red' : 'default' }} />
                </IconButton>
              </motion.div>
              <Badge
                badgeContent={post.likes?.length || 0}
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                  top: '-10px',
                  right: '4px',
                  '& .MuiBadge-badge': {
                    backgroundColor: '#1976d2', // Material-UI blue[700]
                    color: 'white',
                    minWidth: 16,
                    height: 16,
                    fontSize: 10,
                    borderRadius: '50%',
                    padding: 0,
                  },
                }}
                onClick={() => handleShowLikes(post._id)}
              />
              {post.user?._id === currentUserId && (
                <IconButton
                  color="error"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this post?')) {
                      await axios.delete(`/posts/${post._id}`);
                      // Optionally show a toast/snackbar here
                      // Refresh posts (if you have fetchPosts, call it; otherwise, reload page or update state)
                      window.location.reload(); // or call fetchPosts()
                    }
                  }}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
      <Modal open={likeModalOpen} onClose={() => setLikeModalOpen(false)}>
        <Box sx={{ p: 2, bgcolor: 'background.paper', maxWidth: 300, mx: 'auto', mt: 10, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Liked by</Typography>
          <List>
            {likeUsers.map(user => (
              <ListItem key={user._id}>
                <ListItemAvatar>
                  <Avatar>{user.username[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>
    </Box>
  );
}