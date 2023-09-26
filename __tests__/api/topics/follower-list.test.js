const request = require('supertest');
const app = require('../../../app');
const generateUserAndFollowSeeds = require('../__utils__/seeds/users_and_follow_seeds');
const generateTopicAndUserTopics = require('../__utils__/seeds/topic_and_user_topic_seeds');

jest.mock('../../../middlewares/auth');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
  await generateTopicAndUserTopics();
});

const arrayOfFollowerListExpected = expect.arrayContaining([
  expect.objectContaining({
    user_id: expect.any(String),
    username: expect.any(String),
    bio: expect.any(String),
    profile_pic_path: expect.any(String),
    created_at: expect.any(String),
    updated_at: expect.any(String)
  })
]);

describe('GET /topics/follower-list', () => {
  test('should return 200 OK with follower-list of topics', async () => {
    // Execution
    const response = await request(app)
      .get('/topics/follower-list')
      .query({name: 'Topic 1'})
      .set('Authorization', 'Bearer token');

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(arrayOfFollowerListExpected);
  });

  test('should return 200 OK with follower-list of topics with search username', async () => {
    // Execution
    const response = await request(app)
      .get('/topics/follower-list')
      .query({name: 'Topic 1', username: 'username_0'})
      .set('Authorization', 'Bearer token');

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(arrayOfFollowerListExpected);
  });

  test('should return 403 Forbidden if name query not included', async () => {
    // Execution
    const response = await request(app)
      .get('/topics/follower-list')
      .set('Authorization', 'Bearer token');

    // Assertion
    expect(response.statusCode).toBe(403);
    expect(response.body.status).toEqual('error validation');
  });
});
