/* eslint-disable jest/valid-describe-callback */
const supertest = require('supertest');
const app = require('../../../app');
const {createReusableAuthTestSuite} = require('../__authTest__/createReusableAuthTestSuite');
const generateUserAndFollowSeeds = require('../__utils__/seeds/users_and_follow_seeds');

jest.mock('../../../middlewares/auth');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
});

describe('POST /users/populate', () => {
  createReusableAuthTestSuite(supertest(app).get('/users/populate'));
  test('Should return 200 OK with 50 data when no query is set', async () => {
    const response = await supertest(app)
      .get('/users/populate')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(50);
  });
});

describe('POST /users/populate?limit=50&offset=50', () => {
  test('Should return 200 OK with rest of the data if limit and offset is set', async () => {
    const response = await supertest(app)
      .get('/users/populate?limit=50&offset=50')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(10);
  });
});
