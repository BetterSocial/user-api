const moment = require('moment')

const UsersFunction = require("../../../databases/functions/users");
const { filterAllTopics, handleCreatePostTO, insertTopics } = require("../../../utils/post");
const CloudinaryService = require("../../../vendor/cloudinary");
const { User, Locations } = require('../../../databases/models');
const Getstream = require('../../../vendor/getstream');
const LocationFunction = require('../../../databases/functions/location');
const { POST_TYPE_STANDARD } = require('../../../helpers/constants');

/**
 * 
 * @param {import('express').Request} req 
 * @param {boolean} isAnonimous 
 * @returns 
 */
const BetterSocialCreatePost = async (req, isAnonimous = true) => {
    const { userId, body } = req
    const filteredTopics = filterAllTopics(body?.message, body?.topics)

    let userDetail = {};
    if (isAnonimous) userDetail = await UsersFunction.findAnonymousUserId(User, userId);
    else userDetail = await UsersFunction.findUserById(User, userId);

    const getstreamObjectParam = generateDefaultGetstreamObject(body, isAnonimous, userDetail)
    const uploadedImages = await uploadImages(body?.images_url);

    const feedExpiredAt = getFeedDuration(body?.duration_feed)
    const locationDetail = await LocationFunction.getLocationDetail(Locations, body?.location_id)

    let data = {
        verb: body?.verb,
        message: body?.message,
        topics: filteredTopics,
        privacy: body?.privacy,
        object: getstreamObjectParam,
        anonimity: isAnonimous,
        location: body?.location,
        duration_feed: feedExpiredAt,
        images_url: uploadedImages,
        expired_at: feedExpiredAt,
        count_upvote: 0,
        count_downvote: 0,
        post_type: POST_TYPE_STANDARD,
        to: handleCreatePostTO(req?.userId, req?.body),
    }

    try {
        let post = await Getstream.feed.createPost(req?.token, data)
        insertTopics(filteredTopics)
        const scoringProcessData = {
            feed_id: post?.id,
            foreign_id: data?.foreign_id,
            time: post?.time,
            user_id: userDetail.user_id,
            location: locationDetail?.location_level || "", 
            message: data?.message,
            topics: data?.topics,
            privacy: data?.privacy,
            anonimity: data?.anonimity,
            location_level: location,
            duration_feed: data?.duration_feed,
            expired_at: (data?.expired_at) ? moment.utc(data?.expired_at).format("YYYY-MM-DD HH:mm:ss") : "",
            images_url: data?.images_url,
            created_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        }
        addForCreatePost(scoringProcessData);
        return post
    } catch (e) {
        return null
    }

}

module.exports = BetterSocialCreatePost

function generateDefaultGetstreamObject(body, isAnonimous = true, userDetail = null) {
    let defaultGetstreamObject = {
        verb: body?.verb,
        message: body?.message,
        topics: filterAllTopics(body?.message, body?.topics),
        feed_group: body?.feedGroup,
    }

    if (!isAnonimous) {
        defaultGetstreamObject = {
            ...defaultGetstreamObject,
            username: userDetail?.username,
            profile_pic_path: userDetail?.profile_pic_path,
            real_name: userDetail?.real_name,
        }
    }

    return defaultGetstreamObject
}

async function uploadImages(imagesUrl) {
    let cloudinaryLinkArray = []

    for (const url of imagesUrl) {
        const uploadStr = "data:image/jpeg;base64," + url;
        let returnCloudinary = await CloudinaryService.uploadBase64(uploadStr)
        cloudinaryLinkArray.push(returnCloudinary.secure_url)
    }

    return cloudinaryLinkArray
}

function getFeedDuration(durationFeed) {
    let expiredAt = null;

    if (durationFeed !== "never") {
        let dateMoment = moment().add(durationFeed, 'days');
        expiredAt = dateMoment.toISOString();
    }

    return expiredAt
}