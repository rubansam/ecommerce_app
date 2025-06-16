require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const app = express();
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');

app.use(express.json());
app.use('/users', usersRoutes);
app.use('/products', productsRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 