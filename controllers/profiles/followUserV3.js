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
const {StreamChat} = require('stream-chat');
const Environment = require('../../config/environment');

module.exports = async (req, res) => {
  const {user_id_followed, follow_source, with_system_message} = req.body;
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
  }

  const isBlurredPost = await UserFollowUserFunction.checkIsBlurredPost(
    UserFollowUser,
    req?.userId
  );

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
    console.log('Error in follow user v2 sql transaction');
    return ErrorResponse.e409(res, e.message);
  }

  try {
    const followUserExclusive = Getstream.feed.followUserExclusive(req?.userId, user_id_followed);
    const followUser = Getstream.feed.followUser(req?.token, req?.userId, user_id_followed);
    const followMainFeedFollowing = Getstream.feed.followMainFeedFollowing(
      req?.token,
      req?.userId,
      user_id_followed
    );
    const sendJobF2User = sendFollowMainFeedF2(req.userId, user_id_followed);
    // follow certain targeted feeds
    // - exclusive
    // - user
    // - main_feed_following
    await Promise.all([followUserExclusive, followUser, followMainFeedFollowing, sendJobF2User]);

    const anonymousUser = await UsersFunction.findAnonymousUserId(User, user_id_followed);
    const selfAnonymousUser = await UsersFunction.findAnonymousUserId(User, req?.userId);

    await Getstream.feed.followAnonUser(
      req?.token,
      req?.userId,
      user_id_followed,
      selfAnonymousUser?.user_id,
      anonymousUser?.user_id
    );
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
  }

  if (with_system_message) {
    try {
      const adminClient = new StreamChat(
        Environment.GETSTREAM_API_KEY,
        Environment.GETSTREAM_API_SECRET
      );

      const channel = await adminClient.channel('messaging', {
        members: [req?.userId, user_id_followed],
        created_by_id: req?.userId
      });

      await channel?.create();

      await Getstream.chat.sendFollowSignedUserSystemMessage(
        channel,
        req?.userId,
        req?.user?.username,
        targetUser?.username
      );
    } catch (e) {
      console.error('Error in sending system message', e);
    }
  }

  try {
    await BetterSocialCore.fcmToken.sendMultiDeviceNotification(
      req?.userId,
      user?.username,
      user_id_followed,
      targetUser?.username
    );
  } catch (e) {
    console.log('Error in follow user v3 fcm');
    console.log(e);
  }

  return SuccessResponse(res, {
    message: 'User has been followed successfully',
    isBlurredPost
  });
};
