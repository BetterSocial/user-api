const supertest = require('supertest');
const app = require('../../../../app');
const {createReusableAuthTestSuite} = require('../../__authTest__/createReusableAuthTestSuite');
const generateUserAndFollowSeeds = require('../../__utils__/seeds/users_and_follow_seeds');

jest.mock('../../../../middlewares/auth');

beforeEach(async () => {
  await generateUserAndFollowSeeds();
});

const arrayOfFollowedUsersExpected = expect.arrayContaining([
  expect.objectContaining({
    user_id_follower: expect.any(String),
    user_id_followed: expect.any(String),
    user_id: expect.any(String),
    human_id: expect.any(String),
    country_code: expect.any(String),
    username: expect.any(String),
    last_active_at: expect.any(String),
    status: expect.any(String),
    created_at: expect.any(String),
    updated_at: expect.any(String),
    real_name: expect.any(String),
    profile_pic_path: expect.any(String),
    profile_pic_asset_id: expect.any(String),
    profile_pic_public_id: expect.any(String),
    bio: expect.any(String),
    is_banned: expect.any(Boolean),
    is_anonymous: expect.any(Boolean),
    encrypted: expect.any(String),
    allow_anon_dm: expect.any(Boolean),
    only_received_dm_from_user_following: expect.any(Boolean),
    is_backdoor_user: expect.any(Boolean)
  })
]);

const arrayOfMoreUsersExpected = expect.arrayContaining([
  expect.objectContaining({
    user_id: expect.any(String),
    human_id: expect.any(String),
    country_code: expect.any(String),
    username: expect.any(String),
    last_active_at: expect.any(String),
    status: expect.any(String),
    created_at: expect.any(String),
    updated_at: expect.any(String),
    real_name: expect.any(String),
    profile_pic_path: expect.any(String),
    profile_pic_asset_id: expect.any(String),
    profile_pic_public_id: expect.any(String),
    bio: expect.any(String),
    is_banned: expect.any(Boolean),
    is_anonymous: expect.any(Boolean),
    encrypted: expect.any(String),
    allow_anon_dm: expect.any(Boolean),
    only_received_dm_from_user_following: expect.any(Boolean),
    is_backdoor_user: expect.any(Boolean)
  })
]);

describe('GET /users/chat/search', () => {
  createReusableAuthTestSuite(supertest(app).get('/users/chat/search'));
  test('Should return 200 OK with list of data', async () => {
    const response = await supertest(app)
      .get('/users/chat/search')
      .set('Authorization', 'Bearer token');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.next).toBe(50);
    expect(response.body.followed.length).toBe(5);
    expect(response.body.moreUsers.length).toBe(45);
    expect(response.body.followed).toEqual(arrayOfFollowedUsersExpected);
    expect(response.body.moreUsers).toEqual(arrayOfFollowedUsersExpected);
  });

  test('Should return 200 OK with remaining data when sent with offset', async () => {
    const response = await supertest(app)
      .get('/users/chat/search?offset=50')
      .set('Authorization', 'Bearer token');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.next).toBe(69);
    expect(response.body.followed.length).toBe(0);
    expect(response.body.moreUsers.length).toBe(19);
    expect(response.body.moreUsers).toEqual(arrayOfMoreUsersExpected);
  });

  test('Should return 200 OK with list of data when sent with search', async () => {
    const response = await supertest(app)
      .get('/users/chat/search?q=username_3')
      .set('Authorization', 'Bearer token');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.next).toBe(11);
    expect(response.body.followed.length).toBe(5);
    expect(response.body.moreUsers.length).toBe(6);
    expect(response.body.followed).toEqual(arrayOfFollowedUsersExpected);
    expect(response.body.moreUsers).toEqual(arrayOfMoreUsersExpected);
  });
});
