const stream = require('getstream');
const {StreamChat} = require('stream-chat');
const Environment = require('../../config/environment');
const {
  TOPIC_FEED_NAME,
  MAIN_FEED_FOLLOWING_NAME,
  DEFAULT_TOPIC_PIC_PATH_SIGN,
  DEFAULT_TOPIC_PIC_PATH_ANON
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
  const feed = client.feed(MAIN_FEED_FOLLOWING_NAME, userId, token);
  return feed.follow(TOPIC_FEED_NAME, name);
};

const unfollowMainFeedTopic = async (token, userId, name) => {
  name = name.toLowerCase();
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const feed = client.feed(MAIN_FEED_FOLLOWING_NAME, userId, token);
  return feed.unfollow(TOPIC_FEED_NAME, name);
};

const addTopicToChatTab = async (token, topicName, userId, isAnonymous) => {
  try {
    const topic = topicName.toLowerCase();
    const text = isAnonymous
      ? 'This topic has new anonymous followers'
      : 'This topic has new followers';
    const defaultImage = isAnonymous ? DEFAULT_TOPIC_PIC_PATH_ANON : DEFAULT_TOPIC_PIC_PATH_SIGN;

    const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRET);
    await client.connectUser({id: userId}, token);
    const channel = await client.channel('topics', `topic_${topic}`, {
      name: `#${topic}`,
      members: [userId],
      channel_type: 3,
      channel_image: defaultImage,
      channelImage: defaultImage,
      image: defaultImage
    });

    console.log('prepare follow channel', topic);
    await channel.create();
    await channel.addMembers([userId]);
    await channel.sendMessage({text}, {skip_push: true});
    console.log('channel followed');
  } catch (error) {
    console.log('error add topic to chat tab', error);
    throw new Error('error add topic to chat tab');
  }
};

const removeTopicFromChatTab = async (token, topicName, userId) => {
  try {
    const name = topicName.toLowerCase();
    const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRET);
    await client.connectUser({id: userId}, token);
    const channel = await client.channel('topics', `topic_${name}`);

    await channel.removeMembers([userId]);
  } catch (error) {
    console.log('error remove topic to chat tab', error);
    throw new Error('error remove topic to chat tab');
  }
};

module.exports = {
  followTopic,
  followTopics,
  followMainFeedTopic,
  unfollowMainFeedTopic,
  addTopicToChatTab,
  removeTopicFromChatTab
};
