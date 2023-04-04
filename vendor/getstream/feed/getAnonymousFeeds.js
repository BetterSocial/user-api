const GetstreamSingleton = require("../singleton")

const BetterSocialFeedGetAnonymousFeeds = async (anonUserId, limit = 10, offset = 0) => {
    const client = GetstreamSingleton.getInstance()
    const feed = client.feed("user_anon", anonUserId)
    return await feed.get({
        limit,
        offset,
        withReactionCounts: true,
        withOwnReactions: true,
        withRecentReactions: true
    })
}

module.exports = BetterSocialFeedGetAnonymousFeeds