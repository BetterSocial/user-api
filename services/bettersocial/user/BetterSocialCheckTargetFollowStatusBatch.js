const UserFollowUserFunction = require('../../../databases/functions/userFollowUser');

const {UserFollowUser, User} = require('../../../databases/models');

/**
 *
 * @param {string} selfUserId
 * @param {string} targetUserId
 */
const BetterSocialCheckTargetFollowStatusBatch = async (selfUserId, targetUserIds = []) => {
  try {
    const followingStatus = await UserFollowUserFunction.checkTargetUserFollowStatusBatch(
      UserFollowUser,
      User,
      selfUserId,
      targetUserIds
    );

    return {
      isSuccess: true,
      ...followingStatus
    };
  } catch (e) {
    console.log(e);
    return {
      isSuccess: false,
      message: e?.message
    };
  }
};

module.exports = BetterSocialCheckTargetFollowStatusBatch;
