const UsersFunction = require("../../../databases/functions/users");
const GetstreamSingleton = require("../singleton");
const _ = require('lodash')
const {User} = require('../../../databases/models')
module.exports = async (token, message, reactionId, commentAuthorUserId, postMakerId, parentCommentUserId, sendPostNotif = true) => {
    const clientUser = GetstreamSingleton.getClientInstance(token)
    postMakerId = await UsersFunction.findSignedUserId(User, postMakerId)
    commentAuthorUserId = await UsersFunction.findSignedUserId(User, commentAuthorUserId)
    parentCommentUserId = await UsersFunction.findSignedUserId(User, parentCommentUserId)
    let targetFeed = [`notification:${postMakerId}`, `notification:${parentCommentUserId}`, `notification:${commentAuthorUserId}`]
    if (sendPostNotif) {
        targetFeed = _.uniq(targetFeed)
    } else {
        targetFeed = []
    }

    const data = await clientUser.reactions.addChild("comment",
        { id: reactionId },
        {
            text: message,
            count_upvote: 0,
            count_downvote: 0,
            isNotSeen: true
        }, { targetFeeds: targetFeed, userId: commentAuthorUserId });
    return data
};