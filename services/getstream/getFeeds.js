const stream = require("getstream");
module.exports = async (token, feedGroup, query) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed(feedGroup, client.userId, token);
  return user.get(query);
};
