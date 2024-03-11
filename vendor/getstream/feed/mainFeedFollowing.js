const GetstreamConstant = require('../constant');
const GetstreamSingleton = require('../singleton');
const UsersFunction = require('../../../databases/functions/users');
const {User} = require('../../../databases/models');
const stream = require('getstream');

const follow = async (token, userIdFollower, userIdFollowed) => {
  const client = GetstreamSingleton.getInstance();
  // get requested user feed
  const feed = client.feed(GetstreamConstant.MAIN_FEED_FOLLOWING_NAME, userIdFollower, token);
  // follow targeted user feed
  const anonymousUserId = await UsersFunction.findAnonymousUserId(User, userIdFollowed);
  feed.follow(GetstreamConstant.USER_ANON_FEED_NAME, anonymousUserId?.user_id);
  return feed.follow(GetstreamConstant.USER_EXCLUSIVE_FEED_NAME, userIdFollowed);
};

const unfollow = async (token, userIdFollower, userIdFollowed) => {
  const client = GetstreamSingleton.getInstance();
  // follow targeted user feed
  const feed = client.feed(GetstreamConstant.MAIN_FEED_FOLLOWING_NAME, userIdFollower, token);
  // un-follow targeted user feed
  const anonymousUserId = await UsersFunction.findAnonymousUserId(User, userIdFollowed);
  feed.unfollow(GetstreamConstant.USER_ANON_FEED_NAME, anonymousUserId?.user_id);
  return feed.unfollow(GetstreamConstant.USER_EXCLUSIVE_FEED_NAME, userIdFollowed);
};

const unfollow_direct = async (userIdFollower, userIdFollowed) => {
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
  const nameFeed = client.feed(GetstreamConstant.MAIN_FEED_FOLLOWING_NAME, userIdFollower);
  const anonymousUserId = await UsersFunction.findAnonymousUserId(User, userIdFollowed);
  nameFeed.unfollow(GetstreamConstant.USER_ANON_FEED_NAME, anonymousUserId?.user_id);
  return nameFeed.unfollow(GetstreamConstant.USER_EXCLUSIVE_FEED_NAME, userIdFollowed);
};

module.exports = {
  follow,
  unfollow,
  unfollow_direct
};
