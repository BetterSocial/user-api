const UserBlockUserFunction = require('../../../databases/functions/userBlockUser');
const UserFollowUserFunction = require('../../../databases/functions/userFollowUser');
const UsersFunction = require('../../../databases/functions/users');
const {
  sequelize,
  User,
  UserBlockedUser,
  UserBlockedUserHistory,
  UserFollowUser,
  UserFollowUserHistory
} = require('../../../databases/models');
const Getstream = require('../../../vendor/getstream');
const RedisBlockHelper = require('../../redis/helper/RedisBlockHelper');
const BetterSocialScoreBlockUser = require('../score/block-user');

/**
 * @typedef {Object} BetterSocialBlockUserV2OptionalParams
 * @property {string} [postId]
 * @property {Object[]} [reason]
 * @property {string} [message]
 */
/**
 *
 * @param {string} token
 * @param {string} selfUserId
 * @param {string} targetUserId
 * @param {string} source
 * @param {BetterSocialBlockUserV2OptionalParams} params
 */
const BetterSocialBlockUserV2 = async (token, selfUserId, targetUserId, source, params = {}) => {
  const {postId = '', reason = [], message = ''} = params;

  if (selfUserId === targetUserId)
    return {
      isSuccess: false,
      message: "You can't block yourself"
    };

  const targetAnonymousUserId = await UsersFunction.findAnonymousUserId(User, targetUserId);
  const selfAnonymousUserId = await UsersFunction.findAnonymousUserId(User, selfUserId);

  try {
    await sequelize.transaction(async (t) => {
      await UserFollowUserFunction.userBlock(
        UserFollowUser,
        UserFollowUserHistory,
        selfUserId,
        targetUserId,
        {transaction: t, postId}
      );

      await UserBlockUserFunction.userBlock(
        UserBlockedUser,
        UserBlockedUserHistory,
        selfUserId,
        targetUserId,
        source,
        {transaction: t, message, postId, reason}
      );

      if (targetAnonymousUserId?.user_id)
        await UserBlockUserFunction.userBlock(
          UserBlockedUser,
          UserBlockedUserHistory,
          selfUserId,
          targetAnonymousUserId?.user_id,
          source,
          {transaction: t, message, postId, reason, isAnonymous: true}
        );
    });
  } catch (e) {
    console.log('Error in block user v2 sql transaction');
    console.log(e);
    return {
      isSuccess: false,
      message: e?.message || 'Error in block user v2 sql transaction'
    };
  }

  try {
    await RedisBlockHelper.resetBlockUserList(selfUserId);
  } catch (e) {
    console.log('Error in block user v2 redis');
    console.log(e);
    return {
      isSuccess: false,
      message: e?.message || 'Error in block user v2 redis'
    };
  }

  BetterSocialScoreBlockUser(selfUserId, targetUserId, postId);

  try {
    await Getstream.feed.unfollowUser(token, selfUserId, targetUserId);
    await Getstream.feed.unfollowUserExclusive(selfUserId, targetUserId);

    await Getstream.feed.unfollowAnonUser(
      token,
      selfUserId,
      targetUserId,
      selfAnonymousUserId?.user_id,
      targetAnonymousUserId?.user_id
    );
    return {
      isSuccess: true,
      message: 'User has been blocked successfully'
    };
  } catch (e) {
    console.log('Error in block user v2 getstream');
    console.log(e);
    return {
      isSuccess: false,
      message: e?.message || 'Error in block user v2 getstream'
    };
  }
};

module.exports = BetterSocialBlockUserV2;
