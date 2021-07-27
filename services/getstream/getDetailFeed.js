const stream = require("getstream");
module.exports = async (token, activityId, feedGroup = "main_feed") => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  return client
    .feed(feedGroup, client.userId, token)
    .getActivityDetail(activityId, {
      withRecentReactions: true,
      withReactionCounts: true,
    });
};
