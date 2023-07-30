const moment = require('moment');

const UsersFunction = require('../../../databases/functions/users');
const {
  filterAllTopics,
  handleCreatePostTO,
  insertTopics,
  getFeedDuration
} = require('../../../utils/post');
const CloudinaryService = require('../../../vendor/cloudinary');
const {User, Locations, PostAnonUserInfo, sequelize} = require('../../../databases/models');
const Getstream = require('../../../vendor/getstream');
const LocationFunction = require('../../../databases/functions/location');
const {POST_TYPE_STANDARD, POST_VERSION} = require('../../../helpers/constants');
const {addForCreatePost} = require('../../score');
const PostAnonUserInfoFunction = require('../../../databases/functions/postAnonUserInfo');
const {convertLocationFromModel} = require('../../../utils');
const {
  isEmptyMessageAllowed,
  generateDefaultGetstreamObject,
  processPollPost,
  processAnonymous
} = require('./createPostV3');

/**
 *
 * @param {import('express').Request} req
 * @param {boolean} isAnonimous
 * @returns
 */
const BetterSocialCreatePost = async (req, isAnonimous = true) => {
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
      to: handleCreatePostTO(req?.userId, req?.body, isAnonimous, locationTO)
    };

    data = await processPollPost(userId, isAnonimous, body, data);
    data = processAnonymous(isAnonimous, body, data);
  } catch (e) {
    return {
      isSuccess: false,
      message: e.message
    };
  }

  try {
    if (isAnonimous) post = await Getstream.feed.createAnonymousPost(userDetail?.user_id, data);
    else post = await Getstream.feed.createPost(req?.token, data);

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

    insertTopics(filteredTopics);
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
      message: 'Post created successfully'
    };
  } catch (e) {
    return {
      isSuccess: false,
      message: e.message
    };
  }
};

module.exports = BetterSocialCreatePost;
