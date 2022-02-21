const stream = require("getstream");
module.exports = async (token, activityId, message, kind, actor_id) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  return client.reactions.add(kind, activityId, message, {targetFeeds: [`notification:${actor_id}`]});
};
