const stream = require("getstream");

module.exports = async (reactionId, token) => {
  try {
    const client = stream.connect(process.env.API_KEY, process.env.SECRET);
    let result = await client.reactions.get(reactionId);
    return result;
  } catch (e) {
    console.log(e);
    return false;
  }
};
