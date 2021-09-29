const stream = require("getstream");

module.exports = async (activityId, token, data) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  return await client.reactions.update(activityId, data);
};
