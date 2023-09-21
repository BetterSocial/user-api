const stream = require('getstream');

module.exports = async (token, feedGroup, query) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  console.log(`client userID :${client.userId}`);

  if (!('ids' in query)) {
    console.log('Getstream: There is no ids in the req');
    const user = client.feed(feedGroup, client.userId, token);
    return user.get(query);
  }
  console.log('Getstream: There is ids in the req');
  return client.getActivities(query);
};
