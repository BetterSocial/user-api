const stream = require("getstream");
module.exports = async (token, activityId) => {
  console.log(activityId);
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  return client
    .feed("main_feed", client.userId, token)
    .getActivityDetail(activityId, {
      withRecentReactions: true,
      withReactionCounts: true,
    });
};
