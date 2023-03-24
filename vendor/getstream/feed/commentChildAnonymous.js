const stream = require("getstream");
const GetstreamSingleton = require("../singleton");
const _ = require('lodash');
const { createToken } = require("../../../services/getstream");

module.exports = async (anonymousUserId, message, reactionId, commentAuthorUserId, postMakerId, parentCommentUserId, anonUserInfo, sendPostNotif = true) => {
    const anonymousUserToken = await createToken(anonymousUserId);
    const clientUser = GetstreamSingleton.getClientInstance(anonymousUserToken)
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
            isNotSeen: true,
            anon_user_info_color_name: anonUserInfo?.color_name,
            anon_user_info_color_code: anonUserInfo?.color_code,
            anon_user_info_emoji_name: anonUserInfo?.emoji_name,
            anon_user_info_emoji_code: anonUserInfo?.emoji_code,
        }, { targetFeeds: targetFeed, userId: anonymousUserId });
};
