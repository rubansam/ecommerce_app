import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { login } from '../api/auth';
import { useDispatch } from 'react-redux';
import SessionStorage from '../utils/sessionStorage';
import APPCONSTANTS from '../constants/appConstants';

const Login = ({ onLoginSuccess, loading, error }) => {
  const [values, setValues] = useState({ email: '', password: '' });
  const [clientError, setClientError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
        const res = await login(values);
        const { user, token } = res;

        SessionStorage.setItem(APPCONSTANTS.AUTHTOKEN, token);
        SessionStorage.setItem(APPCONSTANTS.USER_ID, user.id);

        dispatch({ type: 'auth/loginSuccess', payload: { user, token } });

        if (onLoginSuccess) onLoginSuccess(user);
        toast.success("LoggedIn successfully!!")
        navigate('/products');
      } catch (err) {
        console.error("Login Error:", err);
        const errorMessage = err.message || 'Failed to login';
        setClientError(errorMessage);
        toast.error(errorMessage);
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