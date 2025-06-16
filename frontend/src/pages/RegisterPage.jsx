import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import { AUTH_ACTION_TYPES } from '../redux/actionTypes/authActionTypes';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (!loading) { // When loading finishes
      if (user && !error) { // If user is present and no error (success)
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      } else if (error) { // If there's an error (failure)
        console.log({error});
        
        toast.error(error.message || 'Registration failed.'); // Revert to error.message for ApiError
      }
    }
  }, [loading, user, error, navigate]);

  const handleRegister = (data) => {
    dispatch({ type: AUTH_ACTION_TYPES.REGISTER_REQUEST, payload: data });
  };

  return (
    <>
    <ToastContainer />
    <UserForm onSubmit={handleRegister} loading={loading} error={error} />
    </>
  );
} 