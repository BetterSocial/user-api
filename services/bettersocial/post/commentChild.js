const UsersFunction = require("../../../databases/functions/users")
const { countProcess } = require("../../../process")
const { User} = require("../../../databases/models")
const QueueTrigger = require('../../queue/trigger')
const Getstream = require('../../../vendor/getstream')
const { USERS_DEFAULT_IMAGE } = require('../../../helpers/constants')
const sendReplyCommentNotification = require('../fcmToken/sendReplyCommentNotification')

const BetterSocialCreateCommentChild = async (req, isAnonimous = true) => {
    try {
        const { body, userId, token } = req

        const { reaction_id, message, anon_user_info, sendPostNotif, postTitle, activityId } = body

        const reaction = await Getstream.feed.getReactionById(reaction_id)
        const post = await Getstream.feed.getPlainFeedById(reaction?.activity_id)
        const postMaker = await UsersFunction.findSignedUserId(User, post?.actor?.id)
        const useridFeed = await UsersFunction.findSignedUserId(User, reaction?.user?.id)
        
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

        if(isAnonimous) result = await Getstream.feed.commentChildAnonymous(selfUser?.user_id, message, reaction_id, selfUser?.userId, postMaker, useridFeed, anon_user_info, isAnonimous, sendPostNotif)
        else result = await Getstream.feed.commentChild(token, message, reaction_id, userId, postMaker, useridFeed, sendPostNotif)

        if (body?.message?.length > 80) {
            await countProcess(reaction_id, { comment_count: +1 }, { comment_count: 1 });
        }

        if (useridFeed) {
            detailUser = await UsersFunction.findUserById(User, useridFeed)
        }


        if (detailUser?.user_id !== req?.user_id) {
            await sendReplyCommentNotification(
                useridFeed,
                commentAuthor,
                message,
                reaction_id,
                postTitle
            )
        }

        QueueTrigger.addCommentToDb({
            authorUserId: postMaker,
            comment: message,
            commenterUserId: userId,
            commentId: result?.id,
            postId: result?.activity_id
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

module.exports = BetterSocialCreateCommentChild