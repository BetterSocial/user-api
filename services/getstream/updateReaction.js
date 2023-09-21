const stream = require('getstream');

module.exports = async (reactionId, message, token) => {
  const clientUser = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  return await clientUser.reactions.update(reactionId, {
    count_downvote: 0,
    count_upvote: 0,
    text: message
  });
};
