const supertest = require('supertest');
const app = require('../../../app');
const {createReusableAuthTestSuite} = require('../__authTest__/createReusableAuthTestSuite');
const {createUser} = require('../__setups__/utils');

describe('GET /api/v1/activity/feeds-v2', () => {
  createReusableAuthTestSuite(supertest(app).get('/api/v1/activity/feeds-v2'));

  test('should fetch activities from getstream and return modified data', async () => {
    // Execution
    await createUser();
    const response = await supertest(app)
      .get('/api/v1/activity/feeds-v2')
      .set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(200);
  });
});
