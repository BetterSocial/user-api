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

const getstream_unfollow_sequence = async (token, feedOwner, feedTarget, direct = false) => {
  try {
    // Main feed following unfollow user anon feed target
    if (direct) {
      await Getstream.feed.unfollowMainFeedFollowingDirect(feedOwner, feedTarget);
    } else {
      await Getstream.feed.unfollowMainFeedFollowing(token, feedOwner, feedTarget);
    }
    // Main feed unfollow user feed target
    await Getstream.feed.unfollowUser(feedOwner, feedTarget);
    // Main feed unfollow user exclusive feed target
    await Getstream.feed.unfollowUserExclusive(feedOwner, feedTarget);
  } catch (e) {
    console.log('Error in block user v2 getstream');
    console.log(e);
    return {
      isSuccess: false,
      message: e?.message || 'Error in block user v2 getstream'
    };
  }
};
const sign_a_unfollow_sign_b = async (unfollowParams) => {
  // Destroy follow from sign A to Sign B
  await UserFollowUserFunction.userBlock(
    unfollowParams.UserFollowUser,
    unfollowParams.UserFollowUserHistory,
    unfollowParams.targetUserId,
    unfollowParams.selfUserId,
    {transaction: unfollowParams.t, postId: unfollowParams.postId}
  );
  await getstream_unfollow_sequence(
    unfollowParams.token,
    unfollowParams.selfUserId,
    unfollowParams.targetUserId
  );
};

const sign_b_unfollow_sign_a = async (unfollowParams) => {
  // Destroy follow from sign B to sign A
  try {
    await UserFollowUserFunction.userBlock(
      unfollowParams.UserFollowUser,
      unfollowParams.UserFollowUserHistory,
      unfollowParams.selfUserId,
      unfollowParams.targetUserId,
      {transaction: unfollowParams.t, postId: unfollowParams.postId}
    );
    await getstream_unfollow_sequence(
      unfollowParams.token,
      unfollowParams.targetUserId,
      unfollowParams.selfUserId,
      true
    );
  } catch (e) {
    console.log('Error in block user v2 getstream');
    console.log(e);
    return {
      isSuccess: false,
      message: e?.message || 'Error in block user v2 getstream'
    };
  }
};

const sign_a_unfollow_anon_b = async (unfollowParams) => {
  // Destroy follow from sign A to Anon B
  await UserFollowUserFunction.userBlock(
    unfollowParams.UserFollowUser,
    unfollowParams.UserFollowUserHistory,
    unfollowParams.targetAnonymousUserId.user_id,
    unfollowParams.selfUserId,
    {transaction: unfollowParams.t, postId: unfollowParams.postId}
  );
};

const sign_b_unfollow_anon_a = async (unfollowParams) => {
  // Destroy follow from sign B to Anon A
  await UserFollowUserFunction.userBlock(
    unfollowParams.UserFollowUser,
    unfollowParams.UserFollowUserHistory,
    unfollowParams.selfAnonymousUserId.user_id,
    unfollowParams.targetUserId,
    {transaction: unfollowParams.t, postId: unfollowParams.postId}
  );
};

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
      // Sign User A block Sign User B
      await UserBlockUserFunction.userBlock(
        UserBlockedUser,
        UserBlockedUserHistory,
        selfUserId,
        targetUserId,
        source,
        {transaction: t, message, postId, reason}
      );

      if (targetAnonymousUserId?.user_id) {
        let unfollowParams = {
          token,
          selfAnonymousUserId,
          targetAnonymousUserId,
          UserFollowUser,
          UserFollowUserHistory,
          targetUserId,
          selfUserId,
          t,
          postId
        };
        // Destroy follow from sign A to Sign B
        await sign_a_unfollow_sign_b(unfollowParams);
        // Destroy follow from sign B to sign A
        await sign_b_unfollow_sign_a(unfollowParams);
        // Destroy follow from sign A to Anon B
        await sign_a_unfollow_anon_b(unfollowParams);
        // Destroy follow from sign B to Anon A
        await sign_b_unfollow_anon_a(unfollowParams);
      }
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

  // Send queue to update score
  BetterSocialScoreBlockUser(selfUserId, targetUserId, postId);
  BetterSocialScoreBlockUser(selfUserId, targetAnonymousUserId?.user_id, '');

  try {
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
