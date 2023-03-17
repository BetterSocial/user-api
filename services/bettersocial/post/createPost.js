const moment = require('moment')

const UsersFunction = require("../../../databases/functions/users");
const { filterAllTopics, handleCreatePostTO, insertTopics, getFeedDuration } = require("../../../utils/post");
const CloudinaryService = require("../../../vendor/cloudinary");
const { User, Locations, sequelize } = require('../../../databases/models');
const Getstream = require('../../../vendor/getstream');
const LocationFunction = require('../../../databases/functions/location');
const { POST_TYPE_STANDARD, POST_TYPE_POLL, POST_VERB_POLL } = require('../../../helpers/constants');
const { addForCreatePost } = require('../../score');
const PostFunction = require('../../../databases/functions/post');
const PollingFunction = require('../../../databases/functions/polling');

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

    const isPollPost = body?.verb === POST_VERB_POLL

    try {
        /**
         * Base Post Process
         */
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
            to: handleCreatePostTO(req?.userId, req?.body, isAnonimous),
        }

        /**
         * Process if Poll Post
         */
        if (isPollPost) {
            const pollExpiredAt = getPollPostExpiredAt(body?.pollsduration, body?.duration_feed)
            if (!pollExpiredAt) return {
                isSuccess: false,
                message: "Polling duration cannot be more than post expiration date"
            }

            const postDate = moment().toISOString()

            const [pollingId, pollsOptionUUIDs] = await sequelize.transaction(async (transaction) => {
                const postId = await PostFunction.createPollPost(sequelize, {
                    userId: req?.userId,
                    anonimity: isAnonimous,
                    createdAt: postDate,
                    updatedAt: postDate,
                    expiredAt: pollExpiredAt,
                    resUrl: '',
                }, transaction)

                const pollingId = await PollingFunction.createPollingByPostId(sequelize, {
                    createdAt: postDate,
                    updatedAt: postDate,
                    message: body?.message,
                    multiplechoice: body?.multiplechoice,
                    postId: postId,
                    userId: req?.userId,
                }, transaction)

                const optionsUUIDs = await PollingFunction.createPollingOptionsByPollId(sequelize, {
                    polls: body?.polls,
                    createdAt: postDate,
                    updatedAt: postDate,
                    pollId: pollingId,
                }, transaction)

                return [pollingId, optionsUUIDs]
            })

            data = {
                ...data,
                polling_id: pollingId,
                polls: pollsOptionUUIDs,
                post_type: POST_TYPE_POLL,
                polls_expired_at: getPollsDurationInIso(body?.pollsduration),
                multiplechoice: body?.multiplechoice,
                expired_at: pollExpiredAt,
            }
        }

        /**
         * Process if Anonymous Post
         */
        if(isAnonimous) {
            data = {
                ...data,
                anon_user_info_color_name: body?.anon_user_info?.color_name,
                anon_user_info_color_code: body?.anon_user_info?.color_code,
                anon_user_info_emoji_name: body?.anon_user_info?.emoji_name,
                anon_user_info_emoji_code: body?.anon_user_info?.emoji_code,
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

function getPollPostExpiredAt(pollsDuration, durationFeed) {
    console.log('pollsDuration, durationFeed')
    console.log(pollsDuration, durationFeed)
    if (durationFeed !== 'never') {
        const pollDurationMoment = getPollsDurationInIso(pollsDuration)
        const pollExpiredAt = moment().add(durationFeed, 'days')
        if (moment(pollDurationMoment).isAfter(pollExpiredAt)) return null;

        return pollExpiredAt.toISOString()
    } else {
        return moment().add(100, 'years').toISOString()
    }
}