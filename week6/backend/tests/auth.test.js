const request = require('supertest');
const { app, mongoose, redisClient } = require('../app');

let server;

beforeAll((done) => {
  server = app.listen(4001, done); // Use a test port
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
  await mongoose.connection.close();
  await redisClient.quit();
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({
        username: 'daviduser',
        email: 'david@example.com',
        password:'TestPass123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered');
  });

  it('should login with correct credentials', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'david@example.com',
        password: 'TestPass123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined(); // <-- This will fail
  });
})