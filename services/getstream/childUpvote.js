const stream = require("getstream");

module.exports = async (reactionId, token) => {
  const clientUser = stream.connect(
    process.env.API_KEY,
    token,
    process.env.APP_ID
  );
  return await clientUser.reactions.addChild(
    "upvotes",
    { id: reactionId },
    {
      count_upvote: 1,
    }
  );
};
