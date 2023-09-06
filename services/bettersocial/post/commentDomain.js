const moment = require('moment');

const UsersFunction = require('../../../databases/functions/users');
const {countProcess} = require('../../../process');
const {User, PostAnonUserInfo} = require('../../../databases/models');
const {addForCommentPost} = require('../../score');
const Getstream = require('../../../vendor/getstream');
const PostAnonUserInfoFunction = require('../../../databases/functions/postAnonUserInfo');
const QueueTrigger = require('../../queue/trigger');

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

const countingProcess = async (activityId, body) => {
  if (body?.message?.length > 80) {
    await countProcess(activityId, {comment_count: +1}, {comment_count: 1});
  }
};

const BetterSocialCreateComment = async (req, isAnonimous = true) => {
  try {
    const {body, userId, token} = req;
    const {activity_id, message, anon_user_info, sendPostNotif} = body;

    const post = await Getstream.feed.getPlainFeedById(activity_id);
    const useridFeed = post.actor.id;

    let result = {};
    if (isAnonimous) {
      const selfUser = await UsersFunction.findAnonymousUserId(User, userId);
      result = await Getstream.feed.commentAnonymous(
        selfUser?.user_id,
        message,
        activity_id,
        useridFeed,
        anon_user_info
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

    QueueTrigger.addCommentToDb({
      postId: result?.activity_id,
      commentId: result?.id,
      authorUserId: useridFeed,
      commenterUserId: userId,
      isAnonymous: isAnonimous,
      comment: message
    });

    const scoringProcessData = {
      comment_id: result?.id,
      user_id: userId,
      feed_id: activity_id,
      message,
      activity_time: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    };
    await addForCommentPost(scoringProcessData);

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

const BetterSocialCreateCommentV3 = async (req) => {
  try {
    const {body, userId, token} = req;
    const {activity_id, message, sendPostNotif} = body;

    const post = await Getstream.feed.getPlainFeedById(activity_id);

    const result = await Getstream.feed.comment(
      token,
      message,
      activity_id,
      userId,
      null,
      sendPostNotif
    );

    QueueTrigger.addCommentToDb({
      postId: result?.activity_id,
      commentId: result?.id,
      authorUserId: post.actor.id,
      commenterUserId: userId,
      isAnonymous: false,
      comment: message
    });

    await countingProcess(activity_id, body);
    await scoringAfterComment(result.id, userId, activity_id, message);

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

const BetterSocialCreateCommentV3Anonymous = async (req) => {
  try {
    const {body, userId} = req;
    const {activity_id, message, anon_user_info} = body;

    const post = await Getstream.feed.getPlainFeedById(activity_id);

    const result = await Getstream.feed.commentAnonymous(
      userId,
      message,
      activity_id,
      null,
      anon_user_info
    );
    await PostAnonUserInfoFunction.createAnonUserInfoInComment(PostAnonUserInfo, {
      postId: activity_id,
      anonUserId: userId,
      anonUserInfoColorCode: anon_user_info?.color_code,
      anonUserInfoColorName: anon_user_info?.color_name,
      anonUserInfoEmojiCode: anon_user_info?.emoji_code,
      anonUserInfoEmojiName: anon_user_info?.emoji_name
    });

    QueueTrigger.addCommentToDb({
      postId: result?.activity_id,
      commentId: result?.id,
      authorUserId: post.actor.id,
      commenterUserId: userId,
      isAnonymous: true,
      comment: message
    });

    await countingProcess(activity_id, body);
    await scoringAfterComment(result.id, userId, activity_id, message);

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
