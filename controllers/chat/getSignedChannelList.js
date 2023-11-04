const {StreamChat} = require('stream-chat');
const {responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE} = require('../../helpers/constants');
const {Topics} = require('../../databases/models');
const TopicFunction = require('../../databases/functions/topics');
const {removePrefixTopic} = require('../../utils/custom');

const MAX_ITERATIONS = 10;

/**
 *
 * @param {StreamChat} client
 * @param {string} userId
 * @param {number} limit
 * @param {number} offset
 * @returns
 */
const __queryChannelBuilder = async (client, userId, limit, offset) => {
  const channels = await client.queryChannels({members: {$in: [userId]}}, [{last_message_at: -1}], {
    limit: limit,
    offset: offset,
    state: true
  });

  return channels;
};

// TODO: Change to this filter after admin system has implemented channel image saving;
// /**
//  *
//  * @param {any} acc
//  * @param {import('stream-chat').Channel} channel
//  * @returns
//  */
// const __filterAndTransformChannelData = (acc, channel) => {
//   const newChannel = {...channel.data};
//   delete newChannel.config;
//   delete newChannel.own_capabilities;

//   const messageLength = channel.state.messages?.length;
//   const channelType = newChannel?.channel_type;

//   if (messageLength === 0 && channelType === CHANNEL_TYPE.TOPIC) return acc;

//   const members = [];
//   Object.keys(channel.state.members).forEach((member) => {
//     members.push(channel?.state?.members[member]);
//   });

//   acc.push({
//     ...newChannel,
//     members,
//     unreadCount: channel.state.unreadCount,
//     messages: channel.state.messages
//   });

//   return acc;
// };

/**
 *
 * @param {import('stream-chat').Channel} channel
 * @returns
 */
const __filterAndTransformChannelData = async (channel) => {
  const newChannel = {...channel.data};
  delete newChannel.config;
  delete newChannel.own_capabilities;

  const messageLength = channel.state.messages?.length;
  const channelType = newChannel?.channel_type;

  if (messageLength === 0 && channelType === CHANNEL_TYPE.TOPIC) return false;

  if (channelType === CHANNEL_TYPE.TOPIC) {
    const topic = await TopicFunction.findOneByName(Topics, removePrefixTopic(newChannel.id));
    newChannel.image = topic.icon_path || null;
    newChannel.channelImage = topic.icon_path || null;
    newChannel.channel_image = topic.icon_path || null;
  }

  const members = [];
  Object.keys(channel.state.members).forEach((member) => {
    members.push(channel?.state?.members[member]);
  });

  return {
    ...newChannel,
    members,
    unreadCount: channel.state.unreadCount,
    messages: channel.state.messages
  };
};

const getSignedChannelList = async (req, res) => {
  const {userId} = req;
  const {limit = 100, offset = 0} = req.query;

  let totalFetched = 0;
  const queriedChannels = [];
  const promisedChannels = [];

  const client = new StreamChat(process.env.API_KEY, process.env.API_SECRET);
  try {
    await client.connectUser({id: req.userId}, req.token);

    while (totalFetched < limit) {
      if (totalFetched > MAX_ITERATIONS * 30) throw new Error('Too many iterations');

      const batchSize = Math.min(30, limit - totalFetched);
      promisedChannels.push(
        __queryChannelBuilder(client, userId, batchSize, Number(totalFetched) + Number(offset))
      );
      totalFetched += batchSize;
      if (totalFetched >= limit) {
        break;
      }
    }

    const responses = await Promise.all(promisedChannels);
    responses.forEach((response) => {
      queriedChannels.push(...response);
    });

    // TODO: Change to this channel filtering after admin system has implemented channel image saving;
    // const channels = queriedChannels.reduce(__filterAndTransformChannelData, []);

    const channels = [];
    for (let i = 0; i < queriedChannels.length; i++) {
      const _channelItem = queriedChannels[i];
      const _filteredChannel = await __filterAndTransformChannelData(_channelItem);

      if (_filteredChannel) channels.push(_filteredChannel);
    }

    return res.status(200).json(responseSuccess('Success retrieve channels', channels));
  } catch (error) {
    return res.status(error.statusCode ?? error.status ?? 400).json({
      status: 'error',
      code: error.statusCode ?? error.status ?? 400,
      message: error.message
    });
  } finally {
    await client.disconnectUser();
  }
};

module.exports = getSignedChannelList;
