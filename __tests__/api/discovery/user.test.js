const supertest = require('supertest');

const app = require('../../../app');

describe('GET /discovery/user', () => {
  test('should return 401 Unauthorized when called with no token', async () => {
    const response = await supertest(app).get('/discovery/user');

    expect(response.statusCode).toBe(401);
  });
});
