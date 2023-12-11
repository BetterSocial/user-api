const {User, sequelize} = require('../../models');
const UsersFunction = require('../users');

const unfollUser = async (
  userFollowUserModel,
  userFollowUserHistoryModel,
  userId,
  followedUser,
  followSource = '',
  t
) => {
  let userFollowed = await userFollowUserModel.findOne(
    {
      where: {
        user_id_follower: userId,
        user_id_followed: followedUser
      },
      raw: true
    },
    {transaction: t, returning: true}
  );

  if (userFollowed) {
    await userFollowUserModel.destroy(
      {
        where: {
          follow_action_id: userFollowed.follow_action_id
        }
      },
      {transaction: t, returning: true}
    );

    await userFollowUserHistoryModel.create(
      {
        user_id_follower: userId,
        user_id_followed: followedUser,
        action: 'out',
        source: followSource.toLowerCase()
      },
      {transaction: t}
    );
  }
};

/**
 *
 * @param {Model} model
 * @param {RegisterBodyData.Users} users
 */
module.exports = async (
  userFollowUserModel,
  userFollowUserHistoryModel,
  userId,
  followedUser = null,
  followSource = '',
  _t = null
) => {
  if (!followedUser) return;
  await sequelize.transaction(async (t) => {
    //unfoll sign user
    await unfollUser(
      userFollowUserModel,
      userFollowUserHistoryModel,
      userId,
      followedUser,
      followSource,
      t
    );
    //end unfoll sign user

    //unfoll anonymous user
    const targetUser = await UsersFunction.findUserById(User, followedUser);
    if (targetUser.is_anonymous === false) {
      const anonymousUser = await UsersFunction.findAnonymousUserId(User, followedUser);
      await unfollUser(
        userFollowUserModel,
        userFollowUserHistoryModel,
        userId,
        anonymousUser.user_id,
        followSource,
        t
      );
    }
    //end unfoll anonymous user
  });
};
