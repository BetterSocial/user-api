const moment = require('moment');

const UserFollowUserFunction = require('../../databases/functions/userFollowUser');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');

const {UserFollowUser, UserFollowUserHistory, User, sequelize} = require('../../databases/models');
const {addForUnfollowUser} = require('../../services/score');
const UsersFunction = require('../../databases/functions/users');
const {sendUnFollowMainFeedF2} = require('../../services/queue/mainFeedF2');

const {unfollowFeed} = require('../../services/getstream/unfollowFeed');
const GetstreamConstant = require('../../vendor/getstream/constant');

module.exports = async (req, res) => {
  const {user_id_followed, follow_source} = req.body;

  if (req?.userId === user_id_followed)
    return ErrorResponse.e403(res, 'Only allow unfollowing other profiles');

  if (
    !(await UserFollowUserFunction.checkIsUserFollowing(
      UserFollowUser,
      req?.userId,
      user_id_followed
    ))
  )
    return ErrorResponse.e409(res, 'You have not followed this user');

  try {
    await sequelize.transaction(async (t) => {
      const userFollowUser = await UserFollowUserFunction.userUnfollow(
        UserFollowUser,
        UserFollowUserHistory,
        req?.userId,
        user_id_followed,
        follow_source,
        t
      );
      return userFollowUser;
    });
  } catch (e) {
    console.log('Error in unfollow user v3 sql transaction');
    return ErrorResponse.e409(res, e.message);
  }

  try {
    // unfollow targeted feeds
    const unfollowUserExclFromMainFeed = unfollowFeed(
      GetstreamConstant.MAIN_FEED_NAME,
      req?.userId,
      GetstreamConstant.USER_EXCLUSIVE_FEED_NAME,
      user_id_followed
    );
    const unfollowUserFromMainFeed = unfollowFeed(
      GetstreamConstant.MAIN_FEED_NAME,
      req?.userId,
      GetstreamConstant.USER_FEED_NAME,
      user_id_followed
    );
    const unfollowUserExclFromMainFeedFollowing = unfollowFeed(
      GetstreamConstant.MAIN_FEED_FOLLOWING_NAME,
      req?.userId,
      GetstreamConstant.USER_EXCLUSIVE_FEED_NAME,
      user_id_followed
    );
    const unfollowUserFromMainFeedFollowing = unfollowFeed(
      GetstreamConstant.MAIN_FEED_FOLLOWING_NAME,
      req?.userId,
      GetstreamConstant.USER_FEED_NAME,
      user_id_followed
    );
    const anonymousUser = await UsersFunction.findAnonymousUserId(User, user_id_followed);
    const selfAnonymousUser = await UsersFunction.findAnonymousUserId(User, req?.userId);
    const userUnfollowTargetAnonUserFromMainFeed = unfollowFeed(
      GetstreamConstant.MAIN_FEED_NAME,
      req?.userId,
      GetstreamConstant.USER_ANON_FEED_NAME,
      anonymousUser
    );

    const targetUserUnfollowAnonUserFromMainFeed = unfollowFeed(
      GetstreamConstant.MAIN_FEED_NAME,
      user_id_followed,
      GetstreamConstant.USER_ANON_FEED_NAME,
      selfAnonymousUser
    );

    const userUnfollowTargetAnonUserFromMainFeedFollowing = unfollowFeed(
      GetstreamConstant.MAIN_FEED_NAME,
      req?.userId,
      GetstreamConstant.USER_ANON_FEED_NAME,
      anonymousUser
    );

    const targetUserUnfollowAnonUserFromMainFeedFollowing = unfollowFeed(
      GetstreamConstant.MAIN_FEED_NAME,
      user_id_followed,
      GetstreamConstant.USER_ANON_FEED_NAME,
      selfAnonymousUser
    );

    const sendJobUnfollowF2User = sendUnFollowMainFeedF2(req.userId, user_id_followed);
    await Promise.all([
      unfollowUserExclFromMainFeed,
      unfollowUserFromMainFeed,
      unfollowUserExclFromMainFeedFollowing,
      unfollowUserFromMainFeedFollowing,
      userUnfollowTargetAnonUserFromMainFeed,
      targetUserUnfollowAnonUserFromMainFeed,
      userUnfollowTargetAnonUserFromMainFeedFollowing,
      targetUserUnfollowAnonUserFromMainFeedFollowing,
      sendJobUnfollowF2User
    ]);
  } catch (e) {
    console.log('Error in unfollow user v3 getstream');
    console.log(e);
    return ErrorResponse.e409(res, e.message);
  }

  try {
    await addForUnfollowUser({
      user_id: req?.user_id ?? req.userId,
      unfollowed_user_id: user_id_followed,
      activity_time: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    });
  } catch (e) {
    console.log('Error in unfollow user v3 scoring');
    return ErrorResponse.e409(res, e.message);
  }

  return SuccessResponse(res, {
    message: 'User has been unfollowed successfully'
  });
};
