const stream = require("getstream");
module.exports = async (token, activityId) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  return client.reactions.filter({
    activity_id: activityId,
  });
};
