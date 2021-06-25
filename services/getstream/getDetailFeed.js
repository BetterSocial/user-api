const stream = require("getstream");
module.exports = async (token, feedGroup, activityId) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  return client
    .feed("main_feed", client.userId, token)
    .getActivityDetail(activityId, {
      enrich: true,
      ownReactions: true,
      withOwnChildren: true,
      withOwnReactions: true,
      withReactionCounts: true,
      withRecentReactions: true,
    });
};
