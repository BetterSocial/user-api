const stream = require("getstream");

module.exports = async (reactionId, token) => {
  const client = stream.connect(
    process.env.API_KEY,
    token,
    process.env.APP_ID
  );
  return await client.reactions.delete(reactionId);
};
