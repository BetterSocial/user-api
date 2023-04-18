const moment = require('moment')

const UsersFunction = require("../../../databases/functions/users")
const { countProcess } = require("../../../process")
const { User, PostAnonUserInfo } = require("../../../databases/models")
const { addForCommentPost } = require("../../score")
const Getstream = require('../../../vendor/getstream')
const { USERS_DEFAULT_IMAGE } = require('../../../helpers/constants')
const PostAnonUserInfoFunction = require('../../../databases/functions/postAnonUserInfo')

const BetterSocialCreateComment = async (req, isAnonimous = true) => {
    try {
        const { body, userId, token } = req
        const { activity_id, message, anon_user_info, sendPostNotif } = body
        let useridFeed = undefined

        let result = {}        
        if (isAnonimous) {
            let selfUser = await UsersFunction.findAnonymousUserId(User, userId)
            result = await Getstream.feed.commentAnonymous(selfUser?.user_id, message, activity_id, useridFeed, anon_user_info)
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

        const scoringProcessData = {
            comment_id: result?.id,
            user_id: userId,
            feed_id: activity_id,
            message: message,
            activity_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        };
        await addForCommentPost(scoringProcessData);

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