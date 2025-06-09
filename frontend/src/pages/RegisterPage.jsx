import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserForm from '../components/UserForm';
import { registerUser } from '../redux/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const handleRegister = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <UserForm onSubmit={handleRegister} loading={loading} error={error} />
  );
} 