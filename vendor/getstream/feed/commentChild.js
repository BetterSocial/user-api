const GetstreamSingleton = require("../singleton");
const _ = require('lodash')

module.exports = async (token, message, reactionId, commentAuthorUserId, postMakerId, parentCommentUserId, sendPostNotif = true) => {
    const clientUser = GetstreamSingleton.getClientInstance(token)
    let targetFeed = [`notification:${postMakerId}`, `notification:${parentCommentUserId}`, `notification:${commentAuthorUserId}`]
    if (sendPostNotif) {
        targetFeed = _.uniq(targetFeed)
    } else {
        targetFeed = []
    }

    return await clientUser.reactions.addChild("comment",
        { id: reactionId },
        {
            text: message,
            count_upvote: 0,
            count_downvote: 0,
            isNotSeen: true
        }, { targetFeeds: targetFeed, userId: commentAuthorUserId });
};
