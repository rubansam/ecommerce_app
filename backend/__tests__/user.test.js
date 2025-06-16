const request = require('supertest');
const app = require('../app'); // Adjust path to your Express app
const User = require('../models/user'); // Adjust path to your User model

describe('User Authentication API', () => {
  // Clean up any test users created after each test to ensure test isolation
  afterEach(async () => {
    await User.destroy({ where: { email: ['test@example.com', 'existing@example.com', 'missing@example.com', 'invalid@example.com', 'shortpass@example.com', 'login@example.com', 'wrongpass@example.com', 'nonexistent@example.com'] } });
  });

  describe('POST /users - User Registration', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toEqual('test@example.com');
    });

    it('should return 400 if required fields are missing during registration', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          name: 'Missing User',
          email: 'missing@example.com',
          // password is missing
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual('Name, email, and password are required.');
    });

    it('should return 400 for invalid email format during registration', async () => {
        const res = await request(app)
          .post('/users')
          .send({
            name: 'Invalid Email User',
            email: 'invalid-email',
            password: 'password123',
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual('Invalid email format.');
    });

    it('should return 400 for password less than 6 characters during registration', async () => {
        const res = await request(app)
          .post('/users')
          .send({
            name: 'Short Pass User',
            email: 'shortpass@example.com',
            password: 'pass',
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual('Password must be at least 6 characters.');
    });

    it('should return 409 if email already exists', async () => {
      // Register a user first
      await request(app)
        .post('/users')
        .send({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'password123',
        });

      // Try to register with the same email again
      const res = await request(app)
        .post('/users')
        .send({
          name: 'Existing User 2',
          email: 'existing@example.com',
          password: 'anotherpass',
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body.error).toEqual('Email already exists');
    });
  });

  describe('POST /login - User Login', () => {
    // Register a user before all login tests
    beforeAll(async () => {
      await request(app)
        .post('/users')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'loginpassword',
        });
    });

    it('should log in an existing user successfully and return a token', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'login@example.com',
          password: 'loginpassword',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toEqual('login@example.com');
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toEqual('Invalid credentials.');
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toEqual('Invalid credentials.');
    });

    it('should return 400 if email or password are missing during login', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'login@example.com',
          // password is missing
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual('Email and password are required.');
    });
  });
}); 