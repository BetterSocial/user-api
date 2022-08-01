const stream = require("getstream");

const client = stream.connect(
    process.env.API_KEY,
    process.env.SECRET,
    process.env.APP_ID
  );

const notificationGetNewFeed = (userid, token) => {
    return client.feed('notification',userid, token).get({
        withRecentReactions:true,
        withReactionCounts: true,
        withOwnReactions: true,
        mark_seen: true,
        mark_read: true
    })
}

module.exports = {
    notificationGetNewFeed,
}