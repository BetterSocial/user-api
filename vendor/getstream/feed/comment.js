const GetstreamSingleton = require("../singleton");

module.exports = async (token, message, activityId, commentAuthorUserId, feedOwnerUserId, sendPostNotif = true) => {
    const clientUser = GetstreamSingleton.getClientInstance(token)
    let targetFeed = [`notification:${feedOwnerUserId}`]
    if (sendPostNotif) {
        if (feedOwnerUserId !== commentAuthorUserId) {
            targetFeed = [...targetFeed, `notification:${commentAuthorUserId}`]
        }
    } else {
        targetFeed = []
    }

    return await clientUser.reactions.add("comment", activityId, {
        text: message,
        count_upvote: 0,
        count_downvote: 0,

        isNotSeen: true
    }, { targetFeeds: targetFeed, userId: commentAuthorUserId });
};
