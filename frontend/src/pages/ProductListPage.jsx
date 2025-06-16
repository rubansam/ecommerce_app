import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid, Card, CardContent, CardMedia, Typography, CircularProgress, Box, Alert, IconButton } from '@mui/material';
import { PRODUCT_ACTION_TYPES } from '../redux/actionTypes/productActionTypes';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

export default function ProductListPage() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(state => state.products);
  const navigate = useNavigate();
  console.log({products});
  
  useEffect(() => {
    dispatch({ type: PRODUCT_ACTION_TYPES.FETCH_PRODUCTS_REQUEST });
  }, [dispatch]);

  const handleLogout = () => {
    console.log("User logged out!");
    navigate('/login');
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Box mt={4}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" width="100%" mb={3}>
        <Typography variant="h4" flexGrow={1} textAlign="center">Our Products</Typography>
        <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" aria-label="shopping cart">
                <ShoppingCartIcon fontSize="large" />
            </IconButton>
            <IconButton color="inherit" aria-label="logout" onClick={handleLogout}>
                <LogoutIcon fontSize="large" />
            </IconButton>
        </Box>
      </Box>
      <Grid container spacing={3} justifyContent="center">
        {products?.products?.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={4} xl={3} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {product.image_url && (
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image_url}
                  alt={product.name || 'Product Image'}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${product.price ? product.price : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 