import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import { CssBaseline } from '@mui/material';
import { setupInterceptors } from './utils/apiInterceptor';

// Call setupInterceptors with the Redux store as soon as it's available
setupInterceptors(store);

function App() {
  return (
    <Provider store={store}>
      <CssBaseline />
      <Router>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={<ProductListPage/>} />
            <Route path="/login" element={<LoginPage />} />
            {/* Add other routes here */}
          </Routes>
        </ErrorBoundary>
      </Router>
    </Provider>
  );
}

export default App; 