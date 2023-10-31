const request = require('supertest');
const app = require('../../../app');
const generateUserAndFollowSeeds = require('../__utils__/seeds/users_and_follow_seeds');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
});

const arrayOfDetailUser = expect.objectContaining({
  user_id: expect.any(String),
  country_code: expect.any(String),
  username: expect.any(String),
  real_name: expect.any(String),
  last_active_at: expect.any(String),
  profile_pic_path: expect.any(String),
  profile_pic_asset_id: expect.any(String),
  profile_pic_public_id: expect.any(String),
  status: expect.any(String),
  bio: expect.any(String),
  is_banned: expect.any(Boolean),
  is_following: expect.any(Boolean),
  is_anonymous: expect.any(Boolean),
  allow_anon_dm: expect.any(Boolean),
  isSignedMessageEnabled: expect.any(Boolean),
  isAnonMessageEnabled: expect.any(Boolean),
  only_received_dm_from_user_following: expect.any(Boolean),
  following_symbol: expect.any(String),
  follower_symbol: expect.any(String),
  verified_status: expect.any(String),
  created_at: expect.any(String),
  updated_at: expect.any(String)
});

describe('GET /profiles/get-other-profile-by-username/:username', () => {
  test('should return 200 OK with detail user found', async () => {
    // Execution
    const response = await request(app)
      .get('/profiles/get-other-profile-by-username/anon_username_0')
      .set('Authorization', 'Bearer token');
    // Assertion
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(arrayOfDetailUser);
  });

  test('should return 404 with user not found', async () => {
    // Execution
    const response = await request(app)
      .get('/profiles/get-other-profile-by-username/userNotFound')
      .set('Authorization', 'Bearer token');
    // Assertion
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
