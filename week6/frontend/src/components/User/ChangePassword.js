import React, { useState } from 'react';
import axios from '../../api/axios';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

export default function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      await axios.post('/user/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      setSuccess('Password changed!');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Password change failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ece9f7 0%, #a1c4fd 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, minWidth: 320 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Change Password
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Old Password"
              name="oldPassword"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={form.oldPassword}
              onChange={handleChange}
              required
            />
            <TextField
              label="New Password"
              name="newPassword"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, mb: 1 }}
            >
              Change Password
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