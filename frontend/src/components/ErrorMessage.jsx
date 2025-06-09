import React from 'react';
import { Typography } from '@mui/material';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <Typography color="error" role="alert" tabIndex={0}>
      {message}
    </Typography>
  );
} 