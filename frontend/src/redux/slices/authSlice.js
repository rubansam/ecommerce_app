import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    registerRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    sessionTimedOut: (state, action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null; // Clear token from state
      localStorage.removeItem('token'); // Clear token from local storage
      localStorage.removeItem('userId'); // Clear user ID from local storage (if stored)
      state.error = action.payload; // Store the session timeout message
    },
    getUserByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getUserByIdSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    getUserByIdFailure: (state, action) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload;
      localStorage.removeItem('token'); // Clear token on failure to get user
      localStorage.removeItem('userId');
    },
  },
});

export const { registerRequest, registerSuccess, registerFailure, loginRequest, loginSuccess, loginFailure, sessionTimedOut, getUserByIdRequest, getUserByIdSuccess, getUserByIdFailure } = authSlice.actions;
export default authSlice.reducer; 