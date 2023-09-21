/* eslint-disable jest/valid-describe-callback */
const supertest = require('supertest');
const app = require('../../../app');
const {createReusableAuthTestSuite} = require('../__authTest__/createReusableAuthTestSuite');
const {v4: uuid} = require('uuid');

const {User, UserFollowUser} = require('../../../databases/models');

const MY_USER_ID = '012345678-1234-1234-1234-123456789012';

jest.mock('../../../middlewares/auth', () => {
  return {
    ...jest.requireActual('../../../middlewares/auth'),
    isAuth: (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (authHeader === null || authHeader === undefined) {
        return res.status(401).json({
          code: 401,
          data: null,
          message: 'Token not provided'
        });
      }

      const token = authHeader.split(' ')[1];
      if (token === null || token === undefined) {
        return res.status(401).json({
          code: 401,
          data: null,
          message: 'Token not provided'
        });
      }
      req.userId = MY_USER_ID;
      next();
    }
  };
});

beforeEach(async () => {
  const bulks = [];
  const followers = [];
  const followings = [];

  bulks.push({
    user_id: MY_USER_ID,
    human_id: `human_id_${0}`,
    country_code: 'ID',
    username: `username_${0}`,
    last_active_at: new Date(),
    status: 'Y',
    created_at: new Date(),
    updated_at: new Date(),
    real_name: `real_name_${0}`,
    profile_pic_path: 'profile_pic_path',
    profile_pic_asset_id: 'profile_pic_asset_id',
    profile_pic_public_id: 'profile_pic_public_id',
    bio: 'bio',
    is_banned: false,
    is_anonymous: false,
    encrypted: 'encrypted',
    allow_anon_dm: true,
    only_received_dm_from_user_following: false,
    is_backdoor_user: false
  });

  for (let i = 1; i < 70; i++) {
    bulks.push({
      user_id: uuid(),
      human_id: `human_id_${i}`,
      country_code: 'ID',
      username: `username_${i}`,
      last_active_at: new Date(),
      status: 'Y',
      created_at: new Date(),
      updated_at: new Date(),
      real_name: `real_name_${i}`,
      profile_pic_path: 'profile_pic_path',
      profile_pic_asset_id: 'profile_pic_asset_id',
      profile_pic_public_id: 'profile_pic_public_id',
      bio: 'bio',
      is_banned: false,
      is_anonymous: false,
      encrypted: 'encrypted',
      allow_anon_dm: true,
      only_received_dm_from_user_following: false,
      is_backdoor_user: false
    });

    if (i <= 30) {
      followers.push({
        follow_action_id: uuid(),
        user_id_follower: bulks[i].user_id,
        user_id_followed: MY_USER_ID
      });
    }

    if (i > 30 && i <= 60) {
      followings.push({
        follow_action_id: uuid(),
        user_id_follower: MY_USER_ID,
        user_id_followed: bulks[i].user_id
      });
    }
  }

  await User.bulkCreate(bulks);
  await UserFollowUser.bulkCreate(followers);
  await UserFollowUser.bulkCreate(followings);
});

describe('POST /api/users/populate', () => {
  createReusableAuthTestSuite(supertest(app).get('/users/populate'));
  test('Should return 200 OK with 50 data when no query is set', async () => {
    const response = await supertest(app)
      .get('/users/populate')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(50);
  });

  test('Should return 200 OK with rest of the data if limit and offset is set', async () => {
    const response = await supertest(app)
      .get('/users/populate?limit=50&offset=50')
      .set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(10);
  });
});
