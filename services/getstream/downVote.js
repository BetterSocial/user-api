const stream = require("getstream");

module.exports = async (activityId, token, actorId) => {
  const clientUser = stream.connect(
    process.env.API_KEY,
    token,
    process.env.APP_ID
  );
  return await clientUser.reactions.add(
    "downvotes",
    { id: activityId },
    {
      count_downvote: 1,
      text: 'You have new downvote'
    },
    {targetFeeds: [`notification:${actorId}`]}
  );
};
