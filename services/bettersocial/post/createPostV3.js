const moment = require('moment');
const Sentry = require('@sentry/node');
const {v4: uuid} = require('uuid');

const {Op} = require('sequelize');
const UsersFunction = require('../../../databases/functions/users');
const {
  filterAllTopics,
  handleCreatePostTO,
  insertTopics,
  getFeedDuration
} = require('../../../utils/post');
const CloudinaryService = require('../../../vendor/cloudinary');
const {
  User,
  Locations,
  PostAnonUserInfo,
  Post,
  Topics,
  sequelize
} = require('../../../databases/models');
const Getstream = require('../../../vendor/getstream');
const LocationFunction = require('../../../databases/functions/location');
const {
  POST_TYPE_STANDARD,
  POST_TYPE_POLL,
  POST_VERB_POLL,
  POST_VERSION
} = require('../../../helpers/constants');
const {addForCreatePost} = require('../../score');
const PollingFunction = require('../../../databases/functions/polling');
const PostAnonUserInfoFunction = require('../../../databases/functions/postAnonUserInfo');
const {convertLocationFromModel} = require('../../../utils');
const sendMultiDeviceTaggedNotification = require('../fcmToken/sendMultiDeviceTaggedNotification');
const PostFunction = require('../../../databases/functions/post');
const {StreamChat} = require('stream-chat');
const Environment = require('../../../config/environment');
const {upVote} = require('../../getstream');
const {countProcess} = require('../../../process');

const isEmptyMessageAllowed = (body) => {
  const isPollPost = body?.verb === POST_VERB_POLL;
  const isBodyEmpty = !body?.message || body?.message === '';
  const isImageUrlEmpty = !body?.images_url || body?.images_url.length === 0;

  return isBodyEmpty && isImageUrlEmpty && !isPollPost;
};

function generateDefaultGetstreamObject(body, isAnonimous = true, userDetail = null) {
  let defaultGetstreamObject = {
    verb: body?.verb,
    message: body?.message,
    topics: filterAllTopics(body?.message, body?.topics),
    feed_group: body?.feedGroup
  };

  if (!isAnonimous) {
    defaultGetstreamObject = {
      ...defaultGetstreamObject,
      username: userDetail?.username,
      profile_pic_path: userDetail?.profile_pic_path,
      real_name: userDetail?.real_name
    };
  }

  return defaultGetstreamObject;
}

function getPollsDurationInIso(pollsDuration) {
  const {day, hour, minute} = pollsDuration;
  const pollsDurationInIso = moment
    .utc()
    .add(day, 'days')
    .add(hour, 'hours')
    .add(minute, 'minutes')
    .toISOString();

  return pollsDurationInIso;
}

function getPollPostExpiredAt(pollsDuration, durationFeed) {
  if (durationFeed !== 'never') {
    const pollDurationMoment = getPollsDurationInIso(pollsDuration);
    const pollExpiredAt = moment().add(durationFeed, 'days');
    if (moment(pollDurationMoment).isAfter(pollExpiredAt)) return null;

    return pollExpiredAt.toISOString();
  }
  return moment().add(100, 'years').toISOString();
}

async function processPost({userId, isAnonimous, body, data, filteredTopics}) {
  const expiredAt =
    body.duration_feed !== 'never'
      ? moment().utc().add(+body.duration_feed, 'day')
      : moment().utc().add(100, 'years');
  const [newPost] = await Promise.all([
    Post.create({
      post_id: uuid(),
      author_user_id: userId,
      anonymous: isAnonimous,
      duration: expiredAt,
      visibility_location_id: body?.location_id,
      post_content: body.message
    }),
    insertTopics(filteredTopics)
  ]);

  const topics = await Topics.findAll({where: {name: {[Op.in]: filteredTopics}}});
  topics.map((topic) => newPost.addTopics(topic));

  return {
    ...data,
    foreign_id: newPost.post_id
  };
}

async function processPollPost(userId, body, data) {
  const isPollPost = body?.verb === POST_VERB_POLL;
  if (!isPollPost) return data;

  const {message, multiplechoice, polls, pollsduration, duration_feed} = body || {};
  /**
   * Process if Poll Post
   */
  const pollExpiredAt = getPollPostExpiredAt(pollsduration, duration_feed);
  if (!pollExpiredAt)
    return {
      isSuccess: false,
      message: 'Polling duration cannot be more than post expiration date'
    };

  const postDate = moment().toISOString();

  const [pollingId, pollsOptionUUIDs] = await sequelize.transaction(async (transaction) => {
    const polling = await PollingFunction.createPollingByPostId(
      sequelize,
      {
        createdAt: postDate,
        updatedAt: postDate,
        message,
        multiplechoice,
        postId: data?.foreign_id,
        userId
      },
      transaction
    );

    const optionsUUIDs = await PollingFunction.createPollingOptionsByPollId(
      sequelize,
      {
        polls,
        pollId: polling
      },
      transaction
    );

    return [polling, optionsUUIDs];
  });

  return {
    ...data,
    foreign_id: data?.foreign_id,
    polling_id: pollingId,
    polls: pollsOptionUUIDs,
    post_type: POST_TYPE_POLL,
    polls_expired_at: getPollsDurationInIso(pollsduration),
    multiplechoice,
    expired_at: pollExpiredAt
  };
}

function processAnonymous(isAnonimous, body, data) {
  /**
   * Process if Anonymous Post
   */
  if (isAnonimous) {
    return {
      ...data,
      anon_user_info_color_name: body?.anon_user_info?.color_name,
      anon_user_info_color_code: body?.anon_user_info?.color_code,
      anon_user_info_emoji_name: body?.anon_user_info?.emoji_name,
      anon_user_info_emoji_code: body?.anon_user_info?.emoji_code
    };
  }

  return data;
}

async function processSendSystemMessage(
  filteredTopics,
  selfUserId,
  username,
  with_system_message = false,
  isAnonimous = false,
  processSendSystemMessage = 'never'
) {
  if (!with_system_message) return;
  if (!filteredTopics) return;
  if (filteredTopics?.length == 0) return;
  if (!selfUserId || !username) throw new Error('Missing params');

  console.log('send system message');
  const post_expired_at =
    processSendSystemMessage !== 'never'
      ? moment().utc().add(+processSendSystemMessage, 'day')
      : moment().utc().add(100, 'years');

  const adminClient = new StreamChat(
    Environment.GETSTREAM_API_KEY,
    Environment.GETSTREAM_API_SECRET
  );

  adminClient.connectUser({id: selfUserId});
  const promises = filteredTopics?.map((topic) => {
    return new Promise((resolve, reject) => {
      const channel = adminClient.channel('topics', `topic_${topic}`);

      channel
        .create()
        .then(() => {
          Getstream.chat
            .sendCreatePostTopicSystemMessage(channel, selfUserId, username, {
              isAnonimous,
              post_expired_at
            })
            .then(() => {
              resolve();
            })
            .catch((e) => {
              // TODO: Temporary fix, implement the sending message in queue if fails.
              console.log('error send system message', e);
            });
        })
        .catch((e) => reject(e));
    });
  });

  await Promise.all(promises);
  adminClient.disconnectUser();
}

/**
 *
 * @param {import('express').Request} req
 * @param {boolean} isAnonimous
 * @returns
 */
const BetterSocialCreatePostV3 = async (req, isAnonimous = true) => {
  const {userId, body} = req;
  const filteredTopics = filterAllTopics(body?.message, body?.topics);

  let userDetail = {};
  let data = {};
  let locationDetail = {};
  let locationToPost = 'Everywhere';
  let locationTO = null;
  let post = {};
  let uploadedImages = body?.images_url || [];

  if (isEmptyMessageAllowed(req?.body))
    return {
      success: false,
      message: 'Post cannot be empty'
    };

  try {
    /**
     * Base Post Process
     */
    if (isAnonimous) userDetail = await UsersFunction.findAnonymousUserId(User, userId);
    else userDetail = await UsersFunction.findUserById(User, userId);
    const getstreamObjectParam = generateDefaultGetstreamObject(body, isAnonimous, userDetail);

    if (!body?.is_photo_uploaded)
      uploadedImages = await CloudinaryService.uploadBase64Array(body?.images_url);

    const feedExpiredAt = getFeedDuration(body?.duration_feed);
    locationDetail = await LocationFunction.getLocationDetail(Locations, body?.location_id);

    if (body?.location !== 'Everywhere') {
      locationToPost = convertLocationFromModel(locationDetail);
      locationTO = convertLocationFromModel(locationDetail, true);
    }

    data = {
      verb: body?.verb,
      message: body?.message,
      topics: filteredTopics,
      privacy: body?.privacy,
      object: getstreamObjectParam,
      anonimity: isAnonimous,
      location: locationToPost,
      duration_feed: body?.duration_feed,
      images_url: uploadedImages,
      expired_at: feedExpiredAt,
      count_upvote: 0,
      count_downvote: 0,
      post_type: POST_TYPE_STANDARD,
      version: POST_VERSION,
      to: handleCreatePostTO(req.userId, req?.body, isAnonimous, locationTO, userDetail.user_id)
    };

    data = await processPost({
      userId: userDetail?.user_id,
      isAnonimous,
      body,
      data,
      filteredTopics
    });
    data = await processPollPost(userDetail?.user_id, body, data);
    data = processAnonymous(isAnonimous, body, data);
  } catch (e) {
    console.log('error creating post', e);
    Sentry.captureException(e);
    return {
      isSuccess: false,
      message: e.message
    };
  }

  const user = isAnonimous
    ? {
        username: `${body?.anon_user_info?.color_name} ${body?.anon_user_info?.emoji_name}`
      }
    : userDetail;

  try {
    if (isAnonimous) post = await Getstream.feed.createAnonymousPost(userDetail?.user_id, data);
    else post = await Getstream.feed.createPost(req?.token, data);

    // Upvote post before sending the success message
    await upVote(post?.id, req.token, userDetail?.user_id);
    countProcess(post?.id, {upvote_count: +1}, {upvote_count: 1});

    body.tagUsers?.forEach(async (user_id) => {
      await sendMultiDeviceTaggedNotification(user, user_id, post.message, post.id);
    });
    if (isAnonimous) {
      await PostAnonUserInfoFunction.createAnonUserInfoInPost(PostAnonUserInfo, {
        postId: post?.id,
        anonUserId: userDetail?.user_id,
        anonUserInfoColorCode: body?.anon_user_info?.color_code,
        anonUserInfoColorName: body?.anon_user_info?.color_name,
        anonUserInfoEmojiCode: body?.anon_user_info?.emoji_code,
        anonUserInfoEmojiName: body?.anon_user_info?.emoji_name
      });
    }
    await processSendSystemMessage(
      filteredTopics,
      req?.userId,
      user?.username,
      body?.with_system_message,
      isAnonimous,
      body?.duration_feed
    );

    await PostFunction.updateGetstreamActivityId(Post, data?.foreign_id, post?.id);

    const scoringProcessData = {
      feed_id: post?.id,
      foreign_id: data?.foreign_id,
      time: post?.time,
      user_id: userDetail.user_id,
      location: locationDetail?.location_level || '',
      message: data?.message,
      topics: data?.topics,
      privacy: data?.privacy,
      anonimity: data?.anonimity,
      location_level: locationToPost,
      duration_feed: data?.duration_feed,
      expired_at: data?.expired_at
        ? moment.utc(data?.expired_at).format('YYYY-MM-DD HH:mm:ss')
        : '',
      images_url: data?.images_url,
      created_at: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    };
    addForCreatePost(scoringProcessData);
    return {
      isSuccess: true,
      message: 'Post created successfully',
      id: post?.id
    };
  } catch (e) {
    console.log('error creating post sending to getstream', e);
    return {
      isSuccess: false,
      message: e.message
    };
  }
};

module.exports = {
  BetterSocialCreatePostV3,
  isEmptyMessageAllowed,
  generateDefaultGetstreamObject,
  processPollPost,
  processAnonymous
};
