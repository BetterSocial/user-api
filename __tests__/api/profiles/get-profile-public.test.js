const request = require('supertest');
const app = require('../../../app');
const generateUserAndFollowSeeds = require('../__utils__/seeds/users_and_follow_seeds');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
});

const arrayOfDetailUser = expect.objectContaining({
  username: expect.any(String),
  profile_pic_path: expect.any(String),
  profile_pic_asset_id: expect.any(String),
  profile_pic_public_id: expect.any(String),
  bio: expect.any(String),
  is_anonymous: expect.any(Boolean),
  allow_anon_dm: expect.any(Boolean),
  only_received_dm_from_user_following: expect.any(Boolean),
  following_symbol: expect.any(String),
  follower_symbol: expect.any(String),
  verified_status: expect.any(String)
});

describe('GET /profiles/get-profile-public/:username', () => {
  test('should return 200 OK with detail user found', async () => {
    // Execution
    const response = await request(app).get('/profiles/get-profile-public/anon_username_0');
    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(arrayOfDetailUser);
  });

  test('should return 404 with user not found', async () => {
    // Execution
    const response = await request(app).get('/profiles/get-profile-public/userNotFound');
    // Assertion
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
