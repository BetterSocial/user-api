const UserBlockUserFunction = require('../../../databases/functions/userBlockUser');
const UsersFunction = require('../../../databases/functions/users');
const {sequelize, User, UserBlockedUser} = require('../../../databases/models');
const Getstream = require('../../../vendor/getstream');
const RedisBlockHelper = require('../../redis/helper/RedisBlockHelper');
const BetterSocialScoreUnblockUser = require('../score/unblock-user');

const isAnonymousUserBlockedFromSignUser = async (selfUserId, anonymousUserId) => {
  const isBlockedFromSign = await UserBlockedUser.findOne({
    where: {
      user_id_blocker: selfUserId,
      user_id_blocked: anonymousUserId
    }
  });
  if (!isBlockedFromSign) return false;
  return isBlockedFromSign.post_id ? false : true;
};
/**
 *
 * @param {string} token
 * @param {string} selfUserId
 * @param {string} targetUserId
 */
const BetterSocialUnblockUserV2 = async (token, selfUserId, targetUserId) => {
  if (selfUserId === targetUserId)
    return {
      isSuccess: false,
      message: "You can't unblock yourself"
    };

  const targetAnonymousUserId = await UsersFunction.findAnonymousUserId(User, targetUserId);
  const anonymousBlockFromSign = await isAnonymousUserBlockedFromSignUser(
    selfUserId,
    targetAnonymousUserId?.user_id
  );
  try {
    await sequelize.transaction(async (t) => {
      await UserBlockUserFunction.userUnblock(UserBlockedUser, selfUserId, targetUserId, {
        transaction: t
      });

      if (anonymousBlockFromSign)
        await UserBlockUserFunction.userUnblock(
          UserBlockedUser,
          selfUserId,
          targetAnonymousUserId?.user_id,
          {
            transaction: t
          }
        );
    });
  } catch (e) {
    console.log('Error in unblock user v2 sql transaction');
    return {
      isSuccess: false,
      message: e?.message || 'Error in unblock user v2 sql transaction'
    };
  }

  try {
    await RedisBlockHelper.resetBlockUserList(selfUserId);
  } catch (e) {
    console.log('Error in unblock user v2 redis');
    console.log(e);
    return {
      isSuccess: false,
      message: e?.message || 'Error in unblock user v2 redis'
    };
  }

  BetterSocialScoreUnblockUser(selfUserId, targetUserId);
  if (anonymousBlockFromSign)
    BetterSocialScoreUnblockUser(selfUserId, targetAnonymousUserId?.user_id);

  try {
    await Getstream.feed.followUser(token, selfUserId, targetUserId);
    await Getstream.feed.followUserExclusive(selfUserId, targetUserId);

    const targetAnonymousUserId = await UsersFunction.findAnonymousUserId(User, targetUserId);
    const selfAnonymousUserId = await UsersFunction.findAnonymousUserId(User, selfUserId);
    await Getstream.feed.followAnonUser(
      token,
      selfUserId,
      targetUserId,
      selfAnonymousUserId?.user_id,
      targetAnonymousUserId?.user_id
    );
    return {
      isSuccess: true,
      message: 'User has been unblocked successfully'
    };
  } catch (e) {
    console.log('Error in unblock user v2 getstream');
    console.log(e);
    return {
      isSuccess: false,
      message: e?.message || 'Error in unblock user v2 getstream'
    };
  }
};

module.exports = BetterSocialUnblockUserV2;
