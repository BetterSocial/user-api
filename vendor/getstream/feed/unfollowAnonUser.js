const GetstreamConstant = require('../constant');
const GetstreamSingleton = require('../singleton');

const unfollowAnonUser = async (
  token,
  userIdFollower,
  userIdFollowed,
  anonUserIdFollower,
  anonUserIdFollowed
) => {
  const client = GetstreamSingleton.getInstance();
  const user = client.feed(GetstreamConstant.MAIN_FEED_NAME, userIdFollower, token);
  const targetUser = client.feed(GetstreamConstant.MAIN_FEED_NAME, userIdFollowed);
  targetUser.unfollow(GetstreamConstant.USER_ANON_FEED_NAME, anonUserIdFollower);
  return user.unfollow(GetstreamConstant.USER_ANON_FEED_NAME, anonUserIdFollowed);
};

module.exports = unfollowAnonUser;
