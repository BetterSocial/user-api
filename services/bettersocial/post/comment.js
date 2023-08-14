const moment = require('moment');

const UsersFunction = require('../../../databases/functions/users');

const {countProcess} = require('../../../process');

const {User, PostAnonUserInfo} = require('../../../databases/models');

const {addForCommentPost} = require('../../score');

const QueueTrigger = require('../../queue/trigger');
const Getstream = require('../../../vendor/getstream');
const {USERS_DEFAULT_IMAGE} = require('../../../helpers/constants');

const PostAnonUserInfoFunction = require('../../../databases/functions/postAnonUserInfo');
const sendMultiDeviceCommentNotification = require('../fcmToken/sendMultiDeviceCommentNotification');

const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const scoringAfterComment = async (commentId, userId, activityId, message) => {
  const scoringProcessData = {
    comment_id: commentId,
    user_id: userId,
    feed_id: activityId,
    message,
    activity_time: moment.utc().format('YYYY-MM-DD HH:mm:ss')
  };
  await addForCommentPost(scoringProcessData);
};

const BetterSocialCreateComment = async (req, isAnonimous = true) => {
  try {
    const {body, userId, token} = req;
    const {activity_id, message, anon_user_info, sendPostNotif} = body;
    const post = await Getstream.feed.getPlainFeedById(activity_id);
    let useridFeed = '';
    if (isAnonimous) {
      useridFeed = await UsersFunction.findSignedUserId(User, post?.actor?.id);
    } else {
      useridFeed = await UsersFunction.findActorId(User, post?.actor?.id);
    }

    let detailUser = {};
    let result = {};
    const commentAuthorEmojiName = anon_user_info?.emoji_name;

    let commentAuthor = {
      username: `Anonymous ${capitalize(commentAuthorEmojiName)}`,
      profile_pic_path: USERS_DEFAULT_IMAGE,
      anon_user_info
    };
    if (!isAnonimous) {
      commentAuthor = await UsersFunction.findUserById(User, userId);
    }

    if (isAnonimous) {
      const selfUser = await UsersFunction.findAnonymousUserId(User, userId);
      if (!selfUser) {
        // when comment using anonToken
        throw new Error('not valid token');
      }
      result = await Getstream.feed.commentAnonymous(
        selfUser?.user_id,
        message,
        activity_id,
        useridFeed,
        anon_user_info,
        sendPostNotif
      );
      await PostAnonUserInfoFunction.createAnonUserInfoInComment(PostAnonUserInfo, {
        postId: activity_id,
        anonUserId: selfUser?.user_id,
        anonUserInfoColorCode: anon_user_info?.color_code,
        anonUserInfoColorName: anon_user_info?.color_name,
        anonUserInfoEmojiCode: anon_user_info?.emoji_code,
        anonUserInfoEmojiName: anon_user_info?.emoji_name
      });
    } else {
      result = await Getstream.feed.comment(
        token,
        message,
        activity_id,
        userId,
        useridFeed,
        sendPostNotif
      );
    }

    if (body?.message?.length > 80) {
      await countProcess(activity_id, {comment_count: +1}, {comment_count: 1});
    }

    if (useridFeed) {
      detailUser = await UsersFunction.findUserById(User, useridFeed);
    }

    if (detailUser?.user_id !== userId) {
      await sendMultiDeviceCommentNotification(useridFeed, commentAuthor, message, activity_id);
    }

    const scoringProcessData = {
      comment_id: result?.id,
      user_id: userId,
      feed_id: activity_id,
      message,
      activity_time: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    };
    await addForCommentPost(scoringProcessData);

    QueueTrigger.addCommentToDb({
      authorUserId: useridFeed,
      comment: message,
      commenterUserId: userId,
      commentId: result?.id,
      postId: activity_id
    });

    return {
      isSuccess: true,
      data: result
    };
  } catch (err) {
    console.log(err);
    return {
      isSuccess: false,
      message: err.message
    };
  }
};

async function BetterSocialCreateCommentV3(req) {
  try {
    const {body, userId, token} = req;
    const {activity_id, message, sendPostNotif} = body;
    const feed = await Getstream.feed.getPlainFeedById(activity_id);
    const {actor} = feed;
    // find comment author by userId provided by token
    const commentAuthor = await UsersFunction.findUserById(User, userId);

    const result = await Getstream.feed.comment(
      token,
      message,
      activity_id,
      userId,
      actor.id,
      sendPostNotif
    );

    if (body?.message?.length > 80) {
      await countProcess(activity_id, {comment_count: +1}, {comment_count: 1});
    }

    if (!(await UsersFunction.checkIsMe(User, actor?.id, userId)))
      await sendMultiDeviceCommentNotification(actor.id, commentAuthor, message, activity_id);

    await scoringAfterComment(result.id, userId, activity_id, message);

    QueueTrigger.addCommentToDb({
      authorUserId: userId,
      comment: message,
      commenterUserId: userId,
      commentId: result?.id,
      postId: activity_id
    });

    return {
      isSuccess: true,
      data: result
    };
  } catch (err) {
    console.log(err);
    return {
      isSuccess: false,
      message: err.message
    };
  }
}

const BetterSocialCreateCommentV3Anonymous = async (req) => {
  try {
    const {body, userId} = req;
    const {activity_id, message, anon_user_info, sendPostNotif} = body;
    // find feed
    const feed = await Getstream.feed.getPlainFeedById(activity_id);
    const {actor} = feed;
    // find signed feedOwnerId
    const signedFeedOwnerId = await UsersFunction.findSignedUserId(User, actor.id);

    const result = await Getstream.feed.commentAnonymous(
      userId,
      message,
      activity_id,
      actor.id,
      anon_user_info,
      sendPostNotif
    );

    const anonInfo = await PostAnonUserInfoFunction.createAnonUserInfoInComment(PostAnonUserInfo, {
      postId: activity_id,
      anonUserId: userId,
      anonUserInfoColorCode: anon_user_info?.color_code,
      anonUserInfoColorName: anon_user_info?.color_name,
      anonUserInfoEmojiCode: anon_user_info?.emoji_code,
      anonUserInfoEmojiName: anon_user_info?.emoji_name
    });

    if (body?.message?.length > 80) {
      await countProcess(activity_id, {comment_count: +1}, {comment_count: 1});
    }

    if (!(await UsersFunction.checkIsMe(User, actor?.id, userId)))
      await sendMultiDeviceCommentNotification(
        signedFeedOwnerId,
        {username: `Anonymous ${capitalize(anonInfo.anon_user_info_emoji_name)}`},
        message,
        activity_id
      );

    await scoringAfterComment(result.id, userId, activity_id, message);

    QueueTrigger.addCommentToDb({
      authorUserId: userId,
      comment: message,
      commenterUserId: userId,
      commentId: result?.id,
      postId: activity_id
    });

    return {
      isSuccess: true,
      data: result
    };
  } catch (err) {
    console.log(err);
    return {
      isSuccess: false,
      message: err.message
    };
  }
};

module.exports = {
  BetterSocialCreateComment,
  BetterSocialCreateCommentV3,
  BetterSocialCreateCommentV3Anonymous
};
