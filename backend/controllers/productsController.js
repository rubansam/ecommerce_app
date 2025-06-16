const Product = require('../models/product');
const redis = require('redis');

// Configure Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => console.log('Connected to Redis!'));
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis only once when the application starts
(async () => {
  await redisClient.connect();
})();

exports.listProducts = async (req, res, next) => {
  const CACHE_KEY = 'all_products';
  try {
    // 1. Try to get data from Redis cache
    const cachedProducts = await redisClient.get(CACHE_KEY);

    if (cachedProducts) {
      console.log('Serving products from Redis cache');
      return res.json({ products: JSON.parse(cachedProducts) });
    }

    // 2. If not in cache, fetch from the database
    const products = await Product.findAll();
    console.log('Serving products from database');

    // 3. Store data in Redis cache with a TTL (e.g., 1 hour = 3600 seconds)
    await redisClient.setEx(CACHE_KEY, 3600, JSON.stringify(products));

    res.json({ products });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;

    if (!name || !price || !stock) {
      return res.status(400).json({ error: 'Product name, price, and stock are required.' });
    }

    // Basic validation for price and stock to be numbers
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number.' });
    }
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number.' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image_url,
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    next(err);
  }
}; 