const request = require('supertest');
const app = require('../../../app');
const generateUserAndFollowSeeds = require('../__utils__/seeds/users_and_follow_seeds');
const generateTopicAndUserTopics = require('../__utils__/seeds/topic_and_user_topic_seeds');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
  await generateTopicAndUserTopics();
});

const arrayOfFollowerLisExpected = expect.arrayContaining([
  expect.objectContaining({
    follow_action_id: expect.any(String),
    user_id_follower: expect.any(String),
    user_id_followed: expect.any(String),
    user: expect.objectContaining({
      user_id: expect.any(String),
      country_code: expect.any(String),
      username: expect.any(String),
      real_name: expect.any(String),
      bio: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      last_active_at: expect.any(String),
      profile_pic_path: expect.any(String),
      profile_pic_asset_id: expect.any(String),
      profile_pic_public_id: expect.any(String),
      status: expect.any(String),
      is_anonymous: expect.any(Boolean),
      following: expect.any(Boolean)
    })
  })
]);

describe('GET /profiles/followers', () => {
  test('should return 200 OK with list of followers', async () => {
    // Execution
    const response = await request(app)
      .get('/profiles/followers')
      .set('Authorization', 'Bearer token');

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(arrayOfFollowerLisExpected);
  });
});
