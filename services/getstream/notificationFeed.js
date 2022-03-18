const stream = require("getstream");

const client = stream.connect(
    process.env.API_KEY,
    process.env.SECRET,
    process.env.APP_ID
  );

const notificationGetNewFeed = (userid, token) => {
    console.log(userid, 'nanak')
    return client.feed('notification',userid, token).get({
        withRecentReactions:true,
        withReactionCounts: true,
        withOwnReactions: true,
        mark_seen: false,
        
    })
}

module.exports = {
    notificationGetNewFeed,
}