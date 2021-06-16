const stream = require("getstream");

module.exports = async (reactionId, token) => {
  const clientUser = stream.connect(process.env.API_KEY, process.env.SECRET);
  return await clientUser.reactions.delete(reactionId);
};
