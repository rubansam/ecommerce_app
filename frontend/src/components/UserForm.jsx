import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function UserForm({ onSubmit, loading, error }) {
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [clientError, setClientError] = useState('');

  const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setClientError('');
  };

  const validate = () => {
    if (!values.name || !values.email || !values.password) {
      setClientError('All fields are required.');
      return false;
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.email)) {
      setClientError('Invalid email format.');
      return false;
    }
    if (values.password.length < 6) {
      setClientError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" mb={2}>Register</Typography>
      <TextField
        label="Name"
        name="name"
        value={values.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        inputProps={{ 'aria-label': 'Name' }}
      />
      <TextField
        label="Email"
        name="email"
        value={values.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        type="email"
        inputProps={{ 'aria-label': 'Email' }}
      />
      <TextField
        label="Password"
        name="password"
        value={values.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        type="password"
        inputProps={{ 'aria-label': 'Password' }}
      />
      {(clientError || error) && (
        <Typography color="error" role="alert" tabIndex={0}>
          {clientError || error}
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ mt: 2 }}
        aria-busy={loading}
      >
        {loading ? 'Registering...' : 'Register'}
      </Button>
    </Box>
  );
} 