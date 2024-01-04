const moment = require('moment');

const UserFollowUserFunction = require('../../databases/functions/userFollowUser');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');

const {UserFollowUser, UserFollowUserHistory, User, sequelize} = require('../../databases/models');
const {addForUnfollowUser} = require('../../services/score');
const UsersFunction = require('../../databases/functions/users');
const {sendUnFollowMainFeedF2} = require('../../services/queue/mainFeedF2');

const unfollowFeed = require('../../services/getstream/unfollowFeed');
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
    const anonymousUser = await UsersFunction.findAnonymousUserId(User, user_id_followed);
    const selfAnonymousUser = await UsersFunction.findAnonymousUserId(User, req?.userId);

    // unfollow_process
    // 1 main_feed {sign_follower_user_id} user_excl {sign_followed_user_id}
    // 2 main_feed {sign_follower_user_id} user {sign_followed_user_id}
    // 3 main_feed_following {sign_follower_user_id} user_excl {sign_followed_user_id}
    // 4 main_feed_following {sign_follower_user_id} user {sign_followed_user_id}
    // 5 main_feed_following {sign_follower_user_id} user_anon {anon_followed_user_id}
    // 6 main_feed {sign_follower_user_id} user_anon {anon_followed_user_id}
    // 7 main_feed {sign_followed_user_id} user_anon {anon_follower_user_id}

    const unfollow_process_1 = unfollowFeed(
      GetstreamConstant.MAIN_FEED_NAME,
      req?.userId,
      GetstreamConstant.USER_EXCLUSIVE_FEED_NAME,
      user_id_followed
    );

    const unfollow_process_2 = unfollowFeed(
      GetstreamConstant.MAIN_FEED_NAME,
      req?.userId,
      GetstreamConstant.USER_FEED_NAME,
      user_id_followed
    );

    const unfollow_process_3 = unfollowFeed(
      GetstreamConstant.MAIN_FEED_FOLLOWING_NAME,
      req?.userId,
      GetstreamConstant.USER_EXCLUSIVE_FEED_NAME,
      user_id_followed
    );

    const unfollow_process_4 = unfollowFeed(
      GetstreamConstant.MAIN_FEED_FOLLOWING_NAME,
      req?.userId,
      GetstreamConstant.USER_FEED_NAME,
      user_id_followed
    );

    const unfollow_process_5 = unfollowFeed(
      GetstreamConstant.MAIN_FEED_FOLLOWING_NAME,
      req?.userId,
      GetstreamConstant.USER_ANON_FEED_NAME,
      anonymousUser?.user_id
    );

    const unfollow_process_6 = unfollowFeed(
      GetstreamConstant.MAIN_FEED_NAME,
      req?.userId,
      GetstreamConstant.USER_ANON_FEED_NAME,
      anonymousUser?.user_id
    );

    const unfollow_process_7 = unfollowFeed(
      GetstreamConstant.MAIN_FEED_NAME,
      user_id_followed,
      GetstreamConstant.USER_ANON_FEED_NAME,
      selfAnonymousUser?.user_id
    );

    const sendJobUnfollowF2User = sendUnFollowMainFeedF2(req.userId, user_id_followed);

    await Promise.all([
      unfollow_process_1,
      unfollow_process_2,
      unfollow_process_3,
      unfollow_process_4,
      unfollow_process_5,
      unfollow_process_6,
      unfollow_process_7,
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
