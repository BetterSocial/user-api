const {v4: uuidv4} = require('uuid');
const {User} = require('../../models');
const UsersFunction = require('../users');

/**
 *
 * @param {Model} model
 * @param {RegisterBodyData.Users} users
 */
module.exports = async (
  userFollowUserModel,
  userFollowUserHistoryModel,
  userId,
  followedUsers = [],
  followSource = '',
  transaction = null
) => {
  if (followedUsers.length === 0) return;
  // User Follow User

  let follows_array = [];
  await Promise.all(
    followedUsers.map(async (val) => {
      //follow sign user
      follows_array.push({
        follow_action_id: uuidv4(),
        user_id_follower: userId,
        user_id_followed: val
      });

      const userFollowed = await UsersFunction.findUserById(User, val);
      if (userFollowed.is_anonymous === false) {
        const anonymousUser = await UsersFunction.findAnonymousUserId(User, val);
        follows_array.push({
          follow_action_id: uuidv4(),
          user_id_follower: userId,
          user_id_followed: anonymousUser?.user_id,
          is_anonymous: true
        });
      }
    })
  );

  let returnUserFollowUser = await userFollowUserModel.bulkCreate(follows_array, {
    transaction,
    returning: true,
    raw: true
  });

  if (returnUserFollowUser.length > 0) {
    let user_follow_user_return = returnUserFollowUser.map((val) => {
      return {
        user_id_follower: val.user_id_follower,
        user_id_followed: val.user_id_followed,
        action: 'in',
        source: followSource
      };
    });
    await userFollowUserHistoryModel.bulkCreate(user_follow_user_return, {
      transaction
    });
  }

  return returnUserFollowUser;
};
