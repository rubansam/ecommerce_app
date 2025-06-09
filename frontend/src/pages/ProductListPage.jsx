import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, CardMedia, Typography, CircularProgress, Box, Alert } from '@mui/material';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/products');
        // Assuming res.data is an array of products, or res.data.products if nested
        // Adding dummy image URLs if the API doesn't provide them, or for initial display.
        const fetchedProducts = (res.data.products || res.data).map(product => ({
          ...product,
          image_url: product.image_url || `https://via.placeholder.com/250?text=${encodeURIComponent(product.name || 'Product')}`
        }));
        setProducts(fetchedProducts);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Box mt={4}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box p={2}>
      <Typography variant="h4" mb={3} textAlign="center">Our Products</Typography>
      <Grid container spacing={3} justifyContent="center">
        {products.map(product => (
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