import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Typography } from '@mui/material';
import axios from '../../api/axios';

export default function PostDialog({ open, onClose, onPost }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!image) {
      setError('Please select an image.');
      return;
    }
    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('image', image);

    try {
      await axios.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCaption('');
      setImage(null);
      onPost && onPost();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create a Post</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Caption"
            fullWidth
            margin="normal"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
          <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
            Upload Image
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </Button>
          {image && <Typography sx={{ mt: 1 }}>{image.name}</Typography>}
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} sx={{ mr: 2 }}>Cancel</Button>
            <Button type="submit" variant="contained">Post</Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}