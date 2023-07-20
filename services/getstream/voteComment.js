const stream = require('getstream');

module.exports = async (reaction_id, token, data) => {
  const client = stream.connect(process.env.API_KEY, process.env.SECRET);
  const result = await client.reactions.update(reaction_id, data, {targetFeeds: data.targetFeeds});
  return result;
};
