const stream = require("getstream");
const createToken = require("../core/createToken");
const GetstreamSingleton = require("../singleton");

module.exports = async (anonymousUserId, message, activityId, feedOwnerUserId, anonUserInfo) => {
    const anonymousToken = await createToken(anonymousUserId)
    const clientUser = GetstreamSingleton.getClientInstance(anonymousToken)
    let targetFeed = [`notification:${feedOwnerUserId}`]

    return await clientUser.reactions.add("comment", activityId, {
        text: message,
        count_upvote: 0,
        count_downvote: 0,
        anon_user_info_color_name: anonUserInfo?.color_name,
        anon_user_info_color_code: anonUserInfo?.color_code,
        anon_user_info_emoji_name: anonUserInfo?.emoji_name,
        anon_user_info_emoji_code: anonUserInfo?.emoji_code,

        isNotSeen: true
    }, { targetFeeds: targetFeed, userId: anonymousUserId });
};
