const moment = require('moment')

const UsersFunction = require("../../../databases/functions/users");
const { filterAllTopics, handleCreatePostTO, insertTopics, getFeedDuration } = require("../../../utils/post");
const CloudinaryService = require("../../../vendor/cloudinary");
const { User, Locations } = require('../../../databases/models');
const Getstream = require('../../../vendor/getstream');
const LocationFunction = require('../../../databases/functions/location');
const { POST_TYPE_STANDARD, POST_TYPE_POLL } = require('../../../helpers/constants');
const { addForCreatePost } = require('../../score');

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
    let data = {}
    let locationDetail = {}
    let post = {}

    const isPollPost = body?.verb === POST_TYPE_POLL

    try {
        if(isPollPost) {
            return {
                success: false,
                message: "Poll post is not supported yet"
            }
        }

        if (isAnonimous) userDetail = await UsersFunction.findAnonymousUserId(User, userId);
        else userDetail = await UsersFunction.findUserById(User, userId);

        const getstreamObjectParam = generateDefaultGetstreamObject(body, isAnonimous, userDetail)
        const uploadedImages = await CloudinaryService.uploadBase64Array(body?.images_url);

        const feedExpiredAt = getFeedDuration(body?.duration_feed)
        locationDetail = await LocationFunction.getLocationDetail(Locations, body?.location_id)

        data = {
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

        if (body?.verb === POST_TYPE_POLL) {
            data = {
                ...data,
                polling_id: pollId,
                polls: pollsOptionUUIDs,
                post_type: POST_TYPE_POLL,
                polls_expired_at: getPollsDurationInIso(body?.polls_duration),
                multiplechoice: body?.multiplechoice,
            }
        }

    } catch (e) {
        console.log(e)
        return {
            isSuccess: false,
            message: e.message
        }
    }

    try {
        if (isAnonimous) post = await Getstream.feed.createAnonymousPost(userDetail?.user_id, data);
        else post = await Getstream.feed.createPost(req?.token, data);

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
            location_level: body?.location,
            duration_feed: data?.duration_feed,
            expired_at: (data?.expired_at) ? moment.utc(data?.expired_at).format("YYYY-MM-DD HH:mm:ss") : "",
            images_url: data?.images_url,
            created_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        }
        addForCreatePost(scoringProcessData);
        return {
            isSuccess: true,
            message: "Post created successfully",
        }
    } catch (e) {
        console.log(e)
        return {
            isSuccess: false,
            message: e.message
        }
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

function getPollsDurationInIso(pollsDuration) {
    const { day, hour, minute } = pollsDuration
    const pollsDurationInIso = moment.utc()
        .add(day, 'days')
        .add(hour, 'hours')
        .add(minute, 'minutes')
        .toISOString()

    return pollsDurationInIso
}