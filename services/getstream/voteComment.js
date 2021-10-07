const stream = require("getstream");

module.exports = async (activityId, token, data) => {
  const client = stream.connect(process.env.API_KEY, process.env.SECRET);
  return await client.reactions.update(activityId, data);
};
