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

        const { activity_id, message, anon_user_info, sendPostNotif } = body
        const post = await Getstream.feed.getPlainFeedById(activity_id)
        const useridFeed = await UsersFunction.findActorId(User, post?.actor?.id)

        let detailUser = {}
        let result = {}

        let commentAuthor = {
            username: anon_user_info?.color_name + ' ' + anon_user_info?.emoji_name,
            profile_pic_path: USERS_DEFAULT_IMAGE,
            anon_user_info
        }
        if (!isAnonimous) {
            commentAuthor = await UsersFunction.findUserById(User, userId)
                     console.log('masuk3')

        }

        let selfUser = await UsersFunction.findAnonymousUserId(User, userId)
                 console.log('masuk4')

        if(isAnonimous) result = await Getstream.feed.commentAnonymous(selfUser?.user_id, message, activity_id, useridFeed, anon_user_info)
        else result = await Getstream.feed.comment(token, message, activity_id, userId, useridFeed, sendPostNotif)
                 console.log('masuk5')

        if (body?.message?.length > 80) {
            await countProcess(activity_id, { comment_count: +1 }, { comment_count: 1 });
                     console.log('masuk5')

        }

        if (useridFeed) {
            detailUser = await UsersFunction.findUserById(User, useridFeed)
                     console.log('masuk7')

        }


        if (detailUser?.user_id !== req?.user_id) {
            await sendCommentNotification(
                useridFeed,
                commentAuthor,
                message,
                activity_id
            )
                     console.log('masuk8')

        }

        const scoringProcessData = {
            comment_id: result?.id,
            user_id: userId,
            feed_id: activity_id,
            message: message,
            activity_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        };
        await addForCommentPost(scoringProcessData);
                 console.log('masuk9')

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