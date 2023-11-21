const GetstreamConstant = require('../constant');
const GetstreamSingleton = require('../singleton');

const follow = async (token, userIdFollower, userIdFollowed) => {
  const client = GetstreamSingleton.getInstance();
  // get requested user feed
  const feed = client.feed(GetstreamConstant.MAIN_FEED_FOLLOWING_NAME, userIdFollower, token);
  // follow targeted user feed
  feed.follow(GetstreamConstant.USER_ANON_FEED_NAME, userIdFollowed);
  return feed.follow(GetstreamConstant.USER_EXCLUSIVE_FEED_NAME, userIdFollowed);
};

const unfollow = async (token, userIdFollower, userIdFollowed) => {
  const client = GetstreamSingleton.getInstance();
  // follow targeted user feed
  const feed = client.feed(GetstreamConstant.MAIN_FEED_FOLLOWING_NAME, userIdFollower, token);
  // un-follow targeted user feed
  feed.unfollow(GetstreamConstant.USER_ANON_FEED_NAME, userIdFollowed);
  return feed.unfollow(GetstreamConstant.USER_EXCLUSIVE_FEED_NAME, userIdFollowed);
};

module.exports = {
  follow,
  unfollow
};
