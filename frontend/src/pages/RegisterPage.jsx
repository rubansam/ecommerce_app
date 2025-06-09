import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import { registerUser } from '../redux/slices/authSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleRegister = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success('Registration successful! Please log in.');
      navigate('/login'); // Redirect to login page after successful registration
    } catch (err) {
      // Error is already handled by UserForm via the `error` prop from Redux state
      // If you want a specific toast for error, you can add it here:
      toast.error(err.message || 'Registration failed.');
    }
  };

  return (
    <>
    <ToastContainer />
    <UserForm onSubmit={handleRegister} loading={loading} error={error} />
    </>
  );
} 