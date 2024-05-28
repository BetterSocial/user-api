const stream = require('getstream');
const {StreamChat} = require('stream-chat');
const Environment = require('../../config/environment');
const {CHANNEL_TYPE_STRING} = require('../../helpers/constants');
const {
  TOPIC_FEED_NAME,
  MAIN_FEED_FOLLOWING_NAME,
  DEFAULT_TOPIC_PIC_PATH_SIGN,
  DEFAULT_TOPIC_PIC_PATH_ANON
} = require('../../vendor/getstream/constant');
const Getstream = require('../../vendor/getstream');
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

const addTopicToChatTab = async (
  token,
  topicName,
  userId,
  isAnonymous,
  topicInvitationIds = [],
  withSystemMessage = false
) => {
  try {
    const topic = topicName.toLowerCase();

    const admin = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRET);
    const adminChannel = admin.channel('topics', `topic_${topic}`);
    const adminChannelData = await adminChannel.create();

    const updateData = {};
    // Revert back all existing signed channel that has anon topic to correct signed one
    if (
      [DEFAULT_TOPIC_PIC_PATH_ANON, DEFAULT_TOPIC_PIC_PATH_SIGN].includes(
        adminChannelData?.channel?.image
      )
    ) {
      updateData.image = null;
    }

    if (
      [DEFAULT_TOPIC_PIC_PATH_ANON, DEFAULT_TOPIC_PIC_PATH_SIGN].includes(
        adminChannelData?.channel?.channelImage
      )
    ) {
      updateData.channelImage = null;
    }

    if (
      [DEFAULT_TOPIC_PIC_PATH_ANON, DEFAULT_TOPIC_PIC_PATH_SIGN].includes(
        adminChannelData?.channel?.channel_image
      )
    ) {
      updateData.channel_image = null;
    }
    // Revert END

    await adminChannel.updatePartial({
      set: updateData
    });

    const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRET);
    const channel = await client.channel('topics', `topic_${topic}`, {
      name: `#${topic}`,
      members: [userId],
      channel_type: 3
    });

    //remove topic invitations channel
    if (topicInvitationIds.length > 0) {
      try {
        topicInvitationIds.forEach(async (topicInvitationsId) => {
          const topicInvitationChannel = client.channel(
            CHANNEL_TYPE_STRING.TOPIC_INVITATION,
            topicInvitationsId
          );
          await topicInvitationChannel.delete();
        });
      } catch (error) {
        console.log('error remove invitations topic channel', error);
        throw new Error('error remove invitations topic channel');
      }
    }

    console.log('prepare follow channel', topic);

    await channel.create();
    await channel.addMembers([userId]);
    if (withSystemMessage) {
      console.log('system message sent');
      await Getstream.chat.sendFollowTopicSystemMessage(channel, userId, {
        isJoinedAnonymous: isAnonymous
      });
    }
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
