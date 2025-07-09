const request = require('supertest');
const { app, mongoose, redisClient } = require('../app');

let server;
let token;

beforeAll((done) => {
  server = app.listen(4002, done); // Use a different port for tests
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
  await mongoose.connection.close();
  await redisClient.quit();
});

describe('User API', () => {
  it('should register and login a user, then get dashboard stats', async () => {
    // Register
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({
        username: 'fortest',
        email: 'fortest@example.com',
        password: 'UserTest123'
      });
    expect(registerRes.statusCode).toBe(201);

    // Login
    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'fortest@example.com',
        password: 'UserTest123'
      });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    token = loginRes.body.token;

    // Get dashboard stats
    const statsRes = await request(server)
      .get('/api/user/dashboard-stats')
      .set('Authorization', `Bearer ${token}`);
    expect(statsRes.statusCode).toBe(200);
    expect(statsRes.body).toHaveProperty('followersCount');
    expect(statsRes.body).toHaveProperty('followRequestsCount');
    expect(statsRes.body).toHaveProperty('totalImages');
    expect(statsRes.body).toHaveProperty('totalVideos');
    expect(statsRes.body).toHaveProperty('dailyUploads');
  });
});