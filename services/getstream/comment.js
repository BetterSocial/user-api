const stream = require("getstream");

module.exports = async (activityId, userId, useridFeed, message, token) => {
  const clientUser = stream.connect(
    process.env.API_KEY,
    token,
    process.env.APP_ID
  );
  return await clientUser.reactions.add("comment", activityId, {
    text: message,
    count_upvote: 0,
    count_downvote: 0,
  }, {targetFeeds: [`notification:${useridFeed}`], userId});
};
