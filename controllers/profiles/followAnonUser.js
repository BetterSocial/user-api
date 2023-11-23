const moment = require('moment');

const UserFollowUserFunction = require('../../databases/functions/userFollowUser');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');

const {UserFollowUser, UserFollowUserHistory, User, sequelize} = require('../../databases/models');
const Getstream = require('../../vendor/getstream');
const {addForFollowUser} = require('../../services/score');
const BetterSocialCore = require('../../services/bettersocial');
const UsersFunction = require('../../databases/functions/users');
const {sendFollowMainFeedF2} = require('../../services/queue/mainFeedF2');

module.exports = async (req, res) => {
  const {user_id_followed, follow_source} = req.body;
  const {user} = req;

  if (req?.userId === user_id_followed)
    return ErrorResponse.e403(res, 'Only allow following other profiles');

  if (
    await UserFollowUserFunction.checkIsUserFollowing(UserFollowUser, req?.userId, user_id_followed)
  )
    return ErrorResponse.e409(res, 'You have followed this user');

  const targetUser = await UsersFunction.findUserById(User, user_id_followed);
  if (!targetUser) {
    return ErrorResponse.e404(res, 'User not found');
  } else if (!targetUser.is_anonymous) {
    return ErrorResponse.e403(res, 'Should be anonymous user');
  }

  try {
    await sequelize.transaction(async (t) => {
      const userFollowUser = await UserFollowUserFunction.registerAddFollowUser(
        UserFollowUser,
        UserFollowUserHistory,
        req?.userId,
        [user_id_followed],
        follow_source,
        t
      );
      return userFollowUser;
    });
  } catch (e) {
    console.log('Error in follow anonymos user sql transaction');
    return ErrorResponse.e409(res, e.message);
  }

  try {
    const followUser = Getstream.feed.followUserAnon(req?.token, req?.userId, user_id_followed);
    const followMainFeedFollowing = Getstream.feed.followMainFeedFollowingAnon(
      req?.token,
      req?.userId,
      user_id_followed
    );
    const sendJobF2User = sendFollowMainFeedF2(req.userId, user_id_followed);
    // follow certain targeted feeds
    // - exclusive
    // - user
    // - main_feed_following
    await Promise.all([followUser, followMainFeedFollowing, sendJobF2User]);
  } catch (e) {
    console.log('Error in follow user v3 getstream');
    console.log(e);
    return ErrorResponse.e409(res, e.message);
  }

  try {
    await addForFollowUser({
      user_id: req?.user_id ?? req.userId,
      followed_user_id: user_id_followed,
      activity_time: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    });
  } catch (e) {
    console.log('Error in follow user v3 scoring');
    return ErrorResponse.e409(res, e.message);
  }

  try {
    const signUserId = await UsersFunction.findSignedUserId(User, user_id_followed);
    await BetterSocialCore.fcmToken.sendMultiDeviceNotification(
      req?.userId,
      user?.username,
      signUserId,
      targetUser?.username
    );
    if (process.env.FEATURE_FLAG_SEND_FOLLOW_SYSTEM_MESSAGE === 'true') {
      Getstream.chat.sendFollowSystemMessage(
        req?.userId,
        user?.username,
        user_id_followed,
        targetUser?.username
      );
    }
  } catch (e) {
    console.log('Error in follow user v3 fcm');
    console.log(e);
    return ErrorResponse.e409(res, e.message);
  }

  return SuccessResponse(res, {
    message: 'User has been followed successfully'
  });
};
