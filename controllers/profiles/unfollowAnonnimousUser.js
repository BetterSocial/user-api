const moment = require('moment');

const UserFollowUserFunction = require('../../databases/functions/userFollowUser');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');

const {UserFollowUser, UserFollowUserHistory, User, sequelize} = require('../../databases/models');
const Getstream = require('../../vendor/getstream');
const {addForUnfollowUser} = require('../../services/score');
const UsersFunction = require('../../databases/functions/users');
const {sendUnFollowMainFeedF2} = require('../../services/queue/mainFeedF2');

module.exports = async (req, res) => {
  const {user_id_followed, follow_source} = req.body;

  if (req?.userId === user_id_followed)
    return ErrorResponse.e403(res, 'Only allow unfollowing other profiles');

  const targetUser = await UsersFunction.findUserById(User, user_id_followed);
  if (!targetUser.is_anonymous) {
    return ErrorResponse.e403(res, 'Error - requires anonymous userID');
  }

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
    console.log('Error in unfollow anonymous sql transaction');
    return ErrorResponse.e409(res, e.message);
  }

  try {
    // unfollow targeted feeds
    const unfollowUser = Getstream.feed.unfollowUser(req?.token, req?.userId, user_id_followed);
    const unfollowMainFeedFollowing = Getstream.feed.unfollowMainFeedFollowing(
      req?.token,
      req?.userId,
      user_id_followed
    );
    const sendJobUnfollowF2User = sendUnFollowMainFeedF2(req.userId, user_id_followed);
    await Promise.all([unfollowUser, unfollowMainFeedFollowing, sendJobUnfollowF2User]);
  } catch (e) {
    console.log('Error in unfollow anonymous user getstream');
    console.log(e);
    return ErrorResponse.e409(res, e.message);
  }

  try {
    await addForUnfollowUser({
      user_id: req?.user_id ?? req.userId,
      followed_user_id: user_id_followed,
      activity_time: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    });
  } catch (e) {
    console.log('Error in unfollow anonymous user scoring');
    return ErrorResponse.e409(res, e.message);
  }

  return SuccessResponse(res, {
    message: 'User has been unfollowed successfully'
  });
};
