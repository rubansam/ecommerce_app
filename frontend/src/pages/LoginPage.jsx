import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import { loginUser } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products'); // Redirect authenticated users to products page
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success('Logged in successfully!');
      navigate('/products');
    } catch (err) {
      // Error toast is already handled by RegisterPage now due to previous change
      // If you want a specific toast for login errors, you can add it here:
      // toast.error(err.message || 'Login failed.');
    }
  };

  return (
    <Login onSubmit={handleLogin} loading={loading} error={error} />
  );
} 