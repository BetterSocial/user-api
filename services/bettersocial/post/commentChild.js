const UsersFunction = require("../../../databases/functions/users")
const { countProcess } = require("../../../process")
const { User, PostAnonUserInfo } = require("../../../databases/models")
const QueueTrigger = require('../../queue/trigger')
const Getstream = require('../../../vendor/getstream')
const { USERS_DEFAULT_IMAGE } = require('../../../helpers/constants')
const PostAnonUserInfoFunction = require("../../../databases/functions/postAnonUserInfo")
const sendMultiDeviceReplyCommentNotification = require("../fcmToken/sendMultiDeviceReplyCommentNotification")

const BetterSocialCreateCommentChild = async (req, isAnonimous) => {
    try {
        const { body, userId, token } = req

        const { reaction_id, message, anon_user_info, sendPostNotif, postTitle } = body
        
        let postMaker = ''

        const reaction = await Getstream.feed.getReactionById(reaction_id)
        const post = await Getstream.feed.getPlainFeedById(reaction?.activity_id)
        if(post?.actor?.id) {
            postMaker = await UsersFunction.findActorId(User, post?.actor?.id)
        }
        
        const useridFeed = await UsersFunction.findActorId(User, reaction?.user?.id)

        let detailUser = {}
        let result = {}

        let commentAuthor = {
            username: 'Anonymous' + ' ' + anon_user_info?.emoji_name,
            profile_pic_path: USERS_DEFAULT_IMAGE,
            anon_user_info
        }
        if (!isAnonimous) {
            commentAuthor = await UsersFunction.findUserById(User, userId)
        }
        let selfUser = await UsersFunction.findAnonymousUserId(User, userId)

        if(isAnonimous) {
            result = await Getstream.feed.commentChildAnonymous(selfUser?.user_id, message, reaction_id, selfUser?.userId, postMaker, useridFeed, anon_user_info, isAnonimous, sendPostNotif)
            await PostAnonUserInfoFunction.createAnonUserInfoInComment(PostAnonUserInfo, {
                postId: reaction?.activity_id,
                anonUserId: selfUser?.user_id,
                anonUserInfoColorCode: anon_user_info?.color_code,
                anonUserInfoColorName: anon_user_info?.color_name,
                anonUserInfoEmojiCode: anon_user_info?.emoji_code,
                anonUserInfoEmojiName: anon_user_info?.emoji_name,
            })
        } else {
            const signPostMaker = await UsersFunction.findSignedUserId(User, postMaker)
            const signUserId = await UsersFunction.findSignedUserId(User, userId)
            const signUseridFeed = await UsersFunction.findSignedUserId(User, useridFeed)
            result = await Getstream.feed.commentChild(token, message, reaction_id, signUserId, signPostMaker, signUseridFeed, sendPostNotif)
        }

        if (body?.message?.length > 80) {
            await countProcess(reaction_id, { comment_count: +1 }, { comment_count: 1 });
        }

        if (useridFeed) {
            detailUser = await UsersFunction.findUserById(User, useridFeed)
        }

        if (detailUser?.user_id !== req?.userId) {
            await sendMultiDeviceReplyCommentNotification(
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

        if (isAnonimous) {
            result = { ...result, user_id: null, user: {}, target_feeds: [] }
        }

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

const BetterSocialCreateCommentChildV3 = async (req) => {
    try {
        const { body, userId, token } = req;
        const { reaction_id, message, anon_user_info, sendPostNotif, postTitle } = body;

        const reaction = await Getstream.feed.getReactionById(reaction_id);
        const feed = await Getstream.feed.getPlainFeedById(reaction?.activity_id);
        // owner of feed
        const userIdFeed = feed?.actor?.id;
        const signedUserIdFeed = await UsersFunction.findSignedUserId(User, userIdFeed);

        // owner of post / parent commment
        const postMakerId = reaction?.user_id;

        let commentAuthor = {
            username: anon_user_info?.color_name + ' ' + anon_user_info?.emoji_name,
            profile_pic_path: USERS_DEFAULT_IMAGE,
            anon_user_info
        }


        const signedPostMakerId = await UsersFunction.findSignedUserId(User, postMakerId)
        const result = await Getstream.feed.commentChild(token, message, reaction_id, userId, signedPostMakerId, signedUserIdFeed, sendPostNotif)

        if (body?.message?.length > 80) {
            await countProcess(reaction_id, { comment_count: +1 }, { comment_count: 1 });
        }

        await sendMultiDeviceReplyCommentNotification(
            signedUserIdFeed,
            commentAuthor,
            message,
            reaction_id,
            postTitle
        )

        QueueTrigger.addCommentToDb({
            authorUserId: postMakerId,
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

const BetterSocialCreateCommentChildV3Anonymous = async (req) => {
    try {
        const { body, userId } = req;
        const { reaction_id, message, anon_user_info, sendPostNotif, postTitle } = body;

        const reaction = await Getstream.feed.getReactionById(reaction_id);
        const feed = await Getstream.feed.getPlainFeedById(reaction?.activity_id);
        // owner of feed
        const userIdFeed = feed?.actor?.id;
        const signedUserIdFeed = await UsersFunction.findSignedUserId(User, userIdFeed);

        // owner of post / parent commment
        const postMakerId = reaction?.user_id;
    

        let commentAuthor = {
            username: anon_user_info?.color_name + ' ' + anon_user_info?.emoji_name,
            profile_pic_path: USERS_DEFAULT_IMAGE,
            anon_user_info
        }

        const result = await Getstream.feed.commentChildAnonymous(userId, message, reaction_id, userId, postMakerId, userIdFeed, anon_user_info, true, sendPostNotif)
        await PostAnonUserInfoFunction.createAnonUserInfoInComment(PostAnonUserInfo, {
            postId: reaction?.activity_id,
            anonUserId: userId,
            anonUserInfoColorCode: anon_user_info?.color_code,
            anonUserInfoColorName: anon_user_info?.color_name,
            anonUserInfoEmojiCode: anon_user_info?.emoji_code,
            anonUserInfoEmojiName: anon_user_info?.emoji_name,
        })

        if (body?.message?.length > 80) {
            await countProcess(reaction_id, { comment_count: +1 }, { comment_count: 1 });
        }

        await sendMultiDeviceReplyCommentNotification(
            signedUserIdFeed,
            commentAuthor,
            message,
            reaction_id,
            postTitle
        )

        QueueTrigger.addCommentToDb({
            authorUserId: postMakerId,
            comment: message,
            commenterUserId: userId,
            commentId: result?.id,
            postId: result?.activity_id
        })

        return {
            isSuccess: true,
            data: { ...result, user_id: null, user: {}, target_feeds: [] }
        }
    } catch (err) {
        console.log(err)
        return {
            isSuccess: false,
            message: err.message
        }
    }
}


module.exports = {
    BetterSocialCreateCommentChild,
    BetterSocialCreateCommentChildV3,
    BetterSocialCreateCommentChildV3Anonymous
}