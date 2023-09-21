const stream = require('getstream');

module.exports = async (reactionId) => {
  const clientUser = stream.connect(process.env.API_KEY, process.env.SECRET);
  return await clientUser.reactions.delete(reactionId);
};
