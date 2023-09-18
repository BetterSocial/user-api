const stream = require('getstream');
module.exports = async (token, feedGroup, targetUserId, query) => {
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
  // const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  console.log(`client userid : ${client.userId}`);
  const user = client.feed(feedGroup, targetUserId, token);
  return user.get(query);
};
