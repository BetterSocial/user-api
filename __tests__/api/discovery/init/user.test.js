const request = require('supertest');
const app = require('../../../../app');

describe('GET /discovery/init/user', () => {
  test('should return 401 Unauthorized when called with no token', async () => {
    const response = await request(app).post('/discovery/init/user');

    expect(response.statusCode).toBe(401);
  });
});
