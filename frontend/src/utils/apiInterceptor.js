import axios from 'axios';
import ERRORS from '../constants/errors';
import ApiError from './ApiError';
import SessionStorage from './sessionStorage';
import APPCONSTANTS from '../constants/appConstants';

// We will define these actions in authSlice later
import { sessionTimedOut } from '../redux/slices/authSlice';

export const setupInterceptors = (store) => {
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.validateStatus = (status) => status >= 200 && status < 300; // Only resolve for 2xx status codes

  axios.interceptors.request.use((request) => {
    const token = SessionStorage.getItem(APPCONSTANTS.AUTHTOKEN);
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  }, (error) => Promise.reject(error));

  axios.interceptors.response.use(
    (response) => {
      const { status } = response;
      // We only handle non-2xx status codes here because validateStatus is set to true for 2xx
      // So, if we reach here, it's already a successful HTTP response.
      return response;
    },
    (error) => {
      // This error handler will only catch network errors or errors that validateStatus returns false for
      const { response } = error;

      if (response) {
        const { status, data } = response;
        switch (status) {
          case 500:
          case 502:
            throw new ApiError(ERRORS.SERVER_ERROR, status);
          case 403:
            throw new ApiError(ERRORS.UNAUTHORIZED, status);
          case 404:
            throw new ApiError(data.message || ERRORS.SERVER_ERROR, status); // Assuming 404 might have a message
          case 401:
            if (data.message === 'Invalid credentials') {
              throw new ApiError(ERRORS.NOT_AUTHENTICATED, status);
            } else { // Session expired or invalid token
              store.dispatch(sessionTimedOut(data.message || ERRORS.SESSION_TIMED_OUT));
              throw new ApiError(data.message || ERRORS.SESSION_TIMED_OUT, status);
            }
          case 409:
            throw new ApiError(data.message || ERRORS.SERVER_ERROR, status);
          case 406:
          case 400:
          case 432:
          case 408:
            throw new ApiError(data.message || ERRORS.SERVER_ERROR, status); // General client errors with message
          default:
            throw new ApiError(ERRORS.SERVER_ERROR, status);
        }
      } else {
        // Network error (no response from server)
        throw new ApiError(ERRORS.NETWORK_ERROR);
      }
    }
  );
}; 