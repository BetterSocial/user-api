const stream = require("getstream");

module.exports = async (reactionId, token, limit = 10) => {
  try {
    const client = stream.connect(process.env.API_KEY, process.env.SECRET);
    let result = await client.reactions.filter({ limit, reaction_id: reactionId});
    return result;
  } catch (e) {
    return false;
  }
};
