import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import { AUTH_ACTION_TYPES } from '../redux/actionTypes/authActionTypes'; // Import action types
import { toast } from 'react-toastify';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!loading) { // When loading finishes
      if (isAuthenticated && !error) { // If authenticated and no error (success)
        toast.success('Logged in successfully!');
        navigate('/products'); // Redirect authenticated users to products page
      } else if (error) { // If there's an error (failure)
        toast.error(error.message || 'Login failed.');
      }
    }
  }, [loading, isAuthenticated, error, navigate]);

  const handleLogin = (data) => {
    dispatch({ type: AUTH_ACTION_TYPES.LOGIN_REQUEST, payload: data });
  };

  return (
    <Login onSubmit={handleLogin} loading={loading} error={error} />
  );
} 