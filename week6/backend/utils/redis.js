const redis = require('redis');
// Configure Redis client
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6380',
  });
  
  redisClient.on('connect', () => console.log('Connected to Redis!'));
  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  
  

  module.exports = redisClient;