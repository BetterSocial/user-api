const moment = require('moment')

const UsersFunction = require("../../../databases/functions/users")
const { countProcess } = require("../../../process")
const { User, FcmToken } = require("../../../databases/models")
const FcmTokenFunction = require("../../../databases/functions/fcmToken")
const sendCommentNotification = require("../fcmToken/sendCommentNotification")
const { addForCommentPost } = require("../../score")
const QueueTrigger = require('../../queue/trigger')
const Getstream = require('../../../vendor/getstream')
const { USERS_DEFAULT_IMAGE } = require('../../../helpers/constants')

const BetterSocialCreateComment = async (req, isAnonimous = true) => {
    try {
        const { body, userId, token } = req

        const { activity_id, useridFeed, message, anon_user_info, sendPostNotif } = body
        let detailUser = {}
        let result = {}

        let commentAuthor = {
            username: anon_user_info?.color_name + ' ' + anon_user_info?.emoji_name,
            profile_pic_path: USERS_DEFAULT_IMAGE,
            anon_user_info
        }
        if (!isAnonimous) {
            commentAuthor = await UsersFunction.findUserById(User, userId)
        }

        let selfUser = await UsersFunction.findAnonymousUserId(User, userId)

        if(isAnonimous) result = await Getstream.feed.commentAnonymous(selfUser?.user_id, message, activity_id, useridFeed, anon_user_info)
        else result = await Getstream.feed.comment(token, message, activity_id, userId, useridFeed, sendPostNotif)

        if (body?.message?.length > 80) {
            await countProcess(activity_id, { comment_count: +1 }, { comment_count: 1 });
        }

        if (useridFeed) {
            detailUser = await UsersFunction.findUserById(User, useridFeed)
        }


        if (detailUser?.user_id !== req?.user_id) {
            await sendCommentNotification(
                useridFeed,
                commentAuthor,
                message,
                activity_id
            )
        }

        const scoringProcessData = {
            comment_id: result?.id,
            user_id: userId,
            feed_id: activity_id,
            message: message,
            activity_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        };
        await addForCommentPost(scoringProcessData);

        QueueTrigger.addCommentToDb({
            authorUserId: useridFeed,
            comment: message,
            commenterUserId: userId,
            commentId: result?.id,
            postId: activity_id
        })

        return {
            isSuccess: true,
            data: result
        }
    } catch (err) {
        console.log(err)
        return {
            isSuccess: false,
            message: err.message
        }
    }
}

module.exports = BetterSocialCreateComment