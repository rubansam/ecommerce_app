require('dotenv').config(); // Load environment variables from .env file
const AWS = require('aws-sdk');
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

const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  accessKeyId: 'test', // Dummy credentials for LocalStack
  secretAccessKey: 'test',
  s3ForcePathStyle: true // Required for S3 with LocalStack
});
s3.listBuckets((err, data) => {
  if (err) {
    console.error('Error connecting to S3:', err);
  } else {
    console.log('S3 Buckets:', data.Buckets);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 