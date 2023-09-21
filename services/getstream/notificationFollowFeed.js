const stream = require('getstream');

const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);

const notificationFollowFeed = async (userid) => {
  const notificationFeed = client.feed('notification', userid);
  return notificationFeed.follow('user', userid, {limit: 0});
};

module.exports = {
  notificationFollowFeed
};
