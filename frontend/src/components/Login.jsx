import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ onLoginSuccess, loading, error }) => {
  const [values, setValues] = useState({ email: '', password: '' });
  const [clientError, setClientError] = useState('');
  const navigate = useNavigate();
  const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setClientError('');
  };

  const validate = () => {
    if (!values.email || !values.password) {
      setClientError('Both email and password are required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setClientError('');
      try {
        const res = await axios.post('users/login', values);
        if (onLoginSuccess) onLoginSuccess(res.data);
        toast.success("LoggedIn successfully!!")
        navigate('/products');
      } catch (err) {
        // Error will be passed from parent via `error` prop or handled here
        // if needed, but for now we rely on the parent or general Axios error.
      }
    }
  };

  return (
    <><ToastContainer />
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" mb={2}>Login</Typography>
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
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </Typography>
    </Box>
    </>
  );
};

export default Login; 