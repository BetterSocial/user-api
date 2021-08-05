const stream = require("getstream");
module.exports = async (token, activityId, feedGroup = "main_feed") => {
  const client = stream.connect(
    process.env.API_KEY,
    process.env.SECRET,
    process.env.APP_ID
  );
  return client.getActivities({
    ids: [activityId],
    withOwnReactions: true,
    withOwnChildren: true,
    enrich: true,
    ownReactions: true,
    reactions: true,
    withReactionCounts: true,
    withRecentReactions: true,
  });
};
