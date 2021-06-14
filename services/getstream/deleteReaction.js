const stream = require("getstream");

module.exports = async (reactionId, token) => {
  const clientUser = stream.connect(
    process.env.API_KEY,
    token,
    process.env.APP_ID
  );
  return await client.reactions.delete(reactionId);
  

  const clientUser = stream.connect(process.env.API_KEY, process.env.SECRET);
  return await clientUser.reactions.delete(reactionId);

};
