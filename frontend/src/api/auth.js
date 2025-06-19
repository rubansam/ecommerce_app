import axios from 'axios';
import SessionStorage from '../utils/sessionStorage';
import APPCONSTANTS from '../constants/appConstants'
// import { toast } from 'react-toastify'; // We'll remove this import as toasts are handled elsewhere

// Axios Interceptor for Authorization Header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(APPCONSTANTS.AUTHTOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  try {
    const response = await axios.post(`/users`, userData);
    return response.data;
  } catch (error) {
    // console.log("Error in auth.js register function:", error.response?.data, error.message, error); // Removed
    // const errorMessage = error.response && error.response.data && error.response.data.error
    //   ? error.response.data.error
    //   : error.message || 'An unexpected error occurred during login.';
    //   console.log("error:message:",errorMessage); // Removed
    //   toast.error(errorMessage) // Removed
      throw error; // Re-throw the original error, interceptor will handle it
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`users/login`, credentials);
    console.log("Login successful, response:", response.data); // Keep this for successful login response
    SessionStorage.setItem(APPCONSTANTS.AUTHTOKEN, response.data.token);
    SessionStorage.setItem(APPCONSTANTS.USER_ID, response.data.user.id);
    return response.data; // Return full data, including user and token
  } catch (error) {
    // const errorMessage = error.response && error.response.data && error.response.data.error
    //   ? error.response.data.error
    //   : error.message || 'An unexpected error occurred during login.';
    //   console.log("error:message:",errorMessage); // Removed
    //   toast.error(errorMessage) // Removed
    throw error; // Re-throw the original error, interceptor will handle it
  }
}; 