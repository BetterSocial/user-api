const UserBlockUserFunction = require('../../../databases/functions/userBlockUser');
const UserFollowUserFunction = require('../../../databases/functions/userFollowUser');
const UsersFunction = require('../../../databases/functions/users');
const {
  User,
  UserFollowUser,
  UserFollowUserHistory,
  UserBlockedUser,
  UserBlockedUserHistory,
  sequelize
} = require('../../../databases/models');
const Getstream = require('../../../vendor/getstream');
const RedisBlockHelper = require('../../redis/helper/RedisBlockHelper');
const BetterSocialScoreBlockUser = require('../score/block-user');

/**
 * @typedef {Object} BetterSocialBlockAnonymousPostV2OptionalParams
 * @property {Object[]} [reason]
 * @property {string} [message]
 */
/**
 *
 * @param {string} token
 * @param {string} selfUserId
 * @param {string} postId
 * @param {string} source
 * @param {BetterSocialBlockAnonymousPostV2OptionalParams} params
 * @returns
 */
const BetterSocialBlockAnonymousComment = async (
  res,
  token,
  selfUserId,
  postId,
  commentId,
  source,
  params = {}
) => {
  let authorAnonymousUserId = null;
  const {reason = [], message = ''} = params;
  const selfAnonymousUserId = await UsersFunction.findAnonymousUserId(User, selfUserId);

  try {
    authorAnonymousUserId = await Getstream.feed.getUserIdFromSource(res, source, {
      post_id: postId,
      comment_id: commentId
    });
  } catch (e) {
    return {
      isSuccess: false,
      message: e?.message || 'Error in fetching getstream post by post id'
    };
  }
  console.log(`${selfAnonymousUserId?.user_id} vs ${authorAnonymousUserId}`);
  if (selfAnonymousUserId?.user_id === authorAnonymousUserId)
    return {
      isSuccess: false,
      message: "You can't block your own post"
    };

  try {
    await sequelize.transaction(async (t) => {
      await UserFollowUserFunction.userBlock(
        UserFollowUser,
        UserFollowUserHistory,
        authorAnonymousUserId,
        selfUserId,
        {transaction: t, postId, commentId}
      );

      await UserBlockUserFunction.userBlock(
        UserBlockedUser,
        UserBlockedUserHistory,
        selfUserId,
        authorAnonymousUserId,
        source,
        {transaction: t, message, postId, reason, isAnonymous: true}
      );
    });
    await Getstream.feed.unfollowMainFeedFollowingAnon(token, selfUserId, authorAnonymousUserId);
  } catch (e) {
    console.log('Error in block user v2 sql transaction');
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
  // send queue to score
  BetterSocialScoreBlockUser(selfUserId, authorAnonymousUserId, postId);

  try {
    await Getstream.feed.unfollowAnonUserByBlockAnonPost(token, selfUserId, authorAnonymousUserId);
    return {
      isSuccess: true,
      message: 'This Anonymous comment has been blocked successfully'
    };
  } catch (e) {
    return {
      isSuccess: false,
      message: e?.message || 'Error in block anonymous comment'
    };
  }
};

module.exports = BetterSocialBlockAnonymousComment;
