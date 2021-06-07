const stream = require("getstream");

module.exports = async (reactionId, token) => {
  const clientUser = stream.connect(
    process.env.API_KEY,
    token,
    process.env.APP_ID
  );
  return await clientUser.reactions.addChild(
    "downvotes",
    { id: reactionId },
    {
      count_downvote: 1,
    }
  );
};
