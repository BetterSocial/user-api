const {v4: uuid} = require('uuid');
const TestConstants = require('../constant');

const {User, UserFollowUser} = require('../../../../databases/models');

const generateUserAndFollowSeeds = async () => {
  const bulks = [];
  const followers = [];
  const followings = [];

  bulks.push({
    user_id: TestConstants.MY_ANONYMOUS_USER_ID,
    human_id: `anon_human_id_${0}`,
    country_code: 'ID',
    username: `anon_username_${0}`,
    last_active_at: new Date(),
    status: 'Y',
    created_at: new Date(),
    updated_at: new Date(),
    real_name: `anon_real_name_${0}`,
    profile_pic_path: 'profile_pic_path',
    profile_pic_asset_id: 'profile_pic_asset_id',
    profile_pic_public_id: 'profile_pic_public_id',
    bio: 'bio',
    is_banned: false,
    is_anonymous: true,
    encrypted: 'encrypted',
    allow_anon_dm: true,
    only_received_dm_from_user_following: false,
    is_backdoor_user: false,
    verified_status: 'VERIFIED'
  });

  bulks.push({
    user_id: TestConstants.MY_USER_ID,
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
    is_backdoor_user: false,
    verified_status: 'VERIFIED'
  });

  for (let i = 2; i < 71; i++) {
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
      is_backdoor_user: false,
      verified_status: 'VERIFIED'
    });

    if (i <= 30) {
      followers.push({
        follow_action_id: uuid(),
        user_id_follower: bulks[i].user_id,
        user_id_followed: TestConstants.MY_USER_ID
      });
    }

    if (i > 30 && i <= 60 + 1 /** 1 = Sum of anon user */) {
      followings.push({
        follow_action_id: uuid(),
        user_id_follower: TestConstants.MY_USER_ID,
        user_id_followed: bulks[i].user_id
      });
    }
  }

  await User.bulkCreate(bulks);
  await UserFollowUser.bulkCreate(followers);
  await UserFollowUser.bulkCreate(followings);

  return {
    users: bulks,
    followers,
    followings
  };
};

module.exports = generateUserAndFollowSeeds;
