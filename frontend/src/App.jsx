import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <Provider store={store}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductListPage />} />
          {/* Add other routes here */}
        </Routes>
      </Router>
    </Provider>
  );
}

export default App; 