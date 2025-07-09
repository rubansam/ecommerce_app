import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { getUserFromToken } from '../../utils/auth';
import { Box, Button, TextField, Typography, Paper, Avatar, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [form, setForm] = useState({ username: '', bio: '', avatar: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const user = getUserFromToken();
  const navigate = useNavigate();
console.log({user});

  useEffect(() => {
    setForm({
      username: user?.username || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put('/user/profile', form);
      setSuccess('Profile updated!');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, minWidth: 350, position: 'relative' }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ position: 'absolute', top: 8, right: 8 }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" align="center" gutterBottom>
            Edit Profile
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar src={form.avatar} sx={{ width: 56, height: 56, bgcolor: '#1976d2' }}>
              {form.username ? form.username[0].toUpperCase() : ''}
            </Avatar>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              name="username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={form.username}
              onChange={handleChange}
              required
            />
            <TextField
              label="Bio"
              name="bio"
              variant="outlined"
              fullWidth
              margin="normal"
              value={form.bio}
              onChange={handleChange}
            />
            <TextField
              label="Avatar URL"
              name="avatar"
              variant="outlined"
              fullWidth
              margin="normal"
              value={form.avatar}
              onChange={handleChange}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, mb: 1 }}
            >
              Save Changes
            </Button>
            {error && (
              <Typography color="error" align="center" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="primary" align="center" sx={{ mt: 1 }}>
                {success}
              </Typography>
            )}
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
}