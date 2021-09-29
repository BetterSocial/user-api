const stream = require("getstream");

module.exports = async (activityId, token) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  return await client.reactions.add(
    "upvotes",
    { id: activityId },
    {
      count_upvote: 1,
    }
  );
};
