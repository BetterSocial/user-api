const request = require('supertest');
const app = require('../../../app');
const TestConstants = require('../../../__tests__/api/__utils__/constant');
const {UserFollowUser} = require('../../../databases/models');
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

  test('should return 200 OK if no have any follower', async () => {
    await UserFollowUser.destroy({where: {user_id_followed: TestConstants.MY_USER_ID}});

    const response = await request(app)
      .get('/profiles/followers')
      .set('Authorization', 'Bearer token');
    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toEqual(0);
  });

  test('should return 200 OK but query filter less than 3', async () => {
    // Execution
    const response = await request(app)
      .get('/profiles/followers')
      .query({q: 'a'})
      .set('Authorization', 'Bearer token');
    console.log(response);

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual(
      'Your search characters is too few, please input 3 or more characters for search'
    );
  });

  test('should return 200 OK with filter query username', async () => {
    // Execution
    const response = await request(app)
      .get('/profiles/followers')
      .query({q: 'username'})
      .set('Authorization', 'Bearer token');

    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(arrayOfFollowerLisExpected);
  });
});
