const moment = require('moment')

const UsersFunction = require("../../../databases/functions/users")
const { countProcess } = require("../../../process")
const { User, PostAnonUserInfo } = require("../../../databases/models")
const { addForCommentPost } = require("../../score")
const QueueTrigger = require('../../queue/trigger')
const Getstream = require('../../../vendor/getstream')
const { USERS_DEFAULT_IMAGE } = require('../../../helpers/constants')
const PostAnonUserInfoFunction = require('../../../databases/functions/postAnonUserInfo')
const sendMultiDeviceCommentNotification = require('../fcmToken/sendMultiDeviceCommentNotification')

const BetterSocialCreateComment = async (req, isAnonimous = true) => {
    try {
        const { body, userId, token } = req
        const { activity_id, message, anon_user_info, sendPostNotif } = body
        const post = await Getstream.feed.getPlainFeedById(activity_id)
        let useridFeed = ''
        if(isAnonimous) {
            useridFeed = await UsersFunction.findSignedUserId(User, post?.actor?.id)
        } else {
            useridFeed = await UsersFunction.findActorId(User, post?.actor?.id)
        }

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
        
        if (isAnonimous) {
            let selfUser = await UsersFunction.findAnonymousUserId(User, userId)
            result = await Getstream.feed.commentAnonymous(selfUser?.user_id, message, activity_id, useridFeed, anon_user_info, sendPostNotif)
            await PostAnonUserInfoFunction.createAnonUserInfoInComment(PostAnonUserInfo, {
                postId: activity_id,
                anonUserId: selfUser?.user_id,
                anonUserInfoColorCode: anon_user_info?.color_code,
                anonUserInfoColorName: anon_user_info?.color_name,
                anonUserInfoEmojiCode: anon_user_info?.emoji_code,
                anonUserInfoEmojiName: anon_user_info?.emoji_name,
            })
        }
        else {
            result = await Getstream.feed.comment(token, message, activity_id, userId, useridFeed, sendPostNotif)
        }

        if (body?.message?.length > 80) {
            await countProcess(activity_id, { comment_count: +1 }, { comment_count: 1 });

        }
        
        if (useridFeed) {
            detailUser = await UsersFunction.findUserById(User, useridFeed)
        }

        if (detailUser?.user_id !== userId) {
            await sendMultiDeviceCommentNotification(
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