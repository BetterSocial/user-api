const stream = require("getstream");
module.exports = async (token, userId, feedGroup) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed("main_feed", client.userId, token);
  return user.follow(feedGroup, userId);
};
