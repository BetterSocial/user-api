const stream = require('getstream');
const followLocation = async (token, userId) => {
  let id = userId.toLowerCase();
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed('main_feed', client.userId, token);
  return user.follow('location', id);
};

module.exports = {
  followLocation
};
