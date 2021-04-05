const stream = require("getstream");
module.exports = async (token, feedGroup, data) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed(feedGroup, client.userId, token);
  data.foreign_id = client.userId + new Date().getTime();
  data.actor = client.user(client.userId).ref();
  return user.addActivity(data);
};
