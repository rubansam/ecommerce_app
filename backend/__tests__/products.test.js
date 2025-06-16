const request = require('supertest');
const app = require('../app'); // Adjust path to your Express app
const Product = require('../models/product'); // Adjust path to your Product model

describe('Product API', () => {
  // Clean up any test products created after each test
  afterEach(async () => {
    await Product.destroy({ where: { name: ['Test Product', 'Another Product', 'Missing Field Product', 'Invalid Price Product', 'Invalid Stock Product'] } });
  });

  describe('GET /products - List Products', () => {
    it('should return a list of products', async () => {
      // Create a test product first to ensure there's data to fetch
      await Product.create({
        name: 'Another Product',
        description: 'Description for another product',
        price: 99.99,
        stock: 50,
        category: 'Electronics',
        image_url: 'http://example.com/another.jpg',
      });

      const res = await request(app).get('/products');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /products - Create Product', () => {
    it('should create a new product successfully', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          name: 'Test Product',
          description: 'Description for test product',
          price: 12.99,
          stock: 100,
          category: 'Clothing',
          image_url: 'http://example.com/test.jpg',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('product');
      expect(res.body.product.name).toEqual('Test Product');
      expect(res.body.product.price).toEqual(12.99);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          name: 'Missing Field Product',
          description: 'Description',
          // price and stock are missing
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual('Product name, price, and stock are required.');
    });

    it('should return 400 for invalid price (non-positive)', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          name: 'Invalid Price Product',
          description: 'Description',
          price: 0,
          stock: 50,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual('Price must be a positive number.');
    });

    it('should return 400 for invalid stock (negative)', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          name: 'Invalid Stock Product',
          description: 'Description',
          price: 20.00,
          stock: -5,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual('Stock must be a non-negative number.');
    });
  });
}); 