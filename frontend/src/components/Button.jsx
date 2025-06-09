import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

export default function Button({ children, loading, disabled, ...props }) {
  return (
    <MuiButton disabled={disabled || loading} {...props}>
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </MuiButton>
  );
} 