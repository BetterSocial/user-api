const stream = require('getstream');
const {
  MAIN_FEED_TOPIC_NAME,
  TOPIC_FEED_NAME,
  MAIN_FEED_FOLLOWING_NAME
} = require('../../vendor/getstream/constant');
const followTopic = async (token, userId) => {
  let id = userId.toLowerCase();
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed('main_feed', client.userId, token);
  return user.follow('topic', id);
};

const followTopics = async (token, userIds) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
  const follows = [];
  userIds.map((item) => {
    follows.push({
      source: 'main_feed:' + client.userId,
      target: 'topic:' + item.toLowerCase()
    });
  });

  let res = await clientServer.followMany(follows);
  return res;
};

const followMainFeedTopic = async (token, userId, name) => {
  name = name.toLowerCase();
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const feed = client.feed(MAIN_FEED_FOLLOWING_NAME, client.userId, token);
  return feed.follow(TOPIC_FEED_NAME, name);
};

const unfollowMainFeedTopic = async (token, userId, name) => {
  name = name.toLowerCase();
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const feed = client.feed(MAIN_FEED_FOLLOWING_NAME, client.userId, token);
  return feed.unfollow(TOPIC_FEED_NAME, name);
};

module.exports = {
  followTopic,
  followTopics,
  followMainFeedTopic,
  unfollowMainFeedTopic
};
