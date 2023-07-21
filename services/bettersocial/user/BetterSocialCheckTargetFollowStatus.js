const UserFollowUserFunction = require('../../../databases/functions/userFollowUser');
const UsersFunction = require('../../../databases/functions/users');

const {UserFollowUser, User} = require('../../../databases/models');

/**
 *
 * @param {string} selfUserId
 * @param {string} targetUserId
 */
const BetterSocialCheckTargetFollowStatus = async (selfUserId, targetUserId) => {
  try {
    const followingStatus = await UserFollowUserFunction.checkTargetUserFollowStatus(
      UserFollowUser,
      selfUserId,
      targetUserId
    );

    const user = await UsersFunction.findUserById(User, targetUserId);

    return {
      isSuccess: true,
      ...followingStatus,
      isAnonymous: user?.is_anonymous
    };
  } catch (e) {
    console.log(e);
    return {
      isSuccess: false,
      message: e?.message
    };
  }
};

module.exports = BetterSocialCheckTargetFollowStatus;
