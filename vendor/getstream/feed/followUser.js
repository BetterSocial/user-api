const GetstreamConstant = require('../constant');
const GetstreamSingleton = require('../singleton');

const followUser = async (token, userIdFollower, userIdFollowed) => {
  const client = GetstreamSingleton.getInstance();
  const user = client.feed(GetstreamConstant.MAIN_FEED_NAME, userIdFollower, token);
  return user.follow(GetstreamConstant.USER_FEED_NAME, userIdFollowed);
};

module.exports = followUser;
