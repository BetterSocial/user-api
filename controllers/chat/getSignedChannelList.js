const {StreamChat} = require('stream-chat');
const {responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE} = require('../../helpers/constants');

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

/**
 *
 * @param {import('stream-chat').Channel} channel
 * @returns
 */
const __transformChannelData = (channel) => {
  const newChannel = {...channel.data};
  delete newChannel.config;
  delete newChannel.own_capabilities;

  const messageLength = channel.state.messages?.length;
  const channelType = newChannel?.channel_type;

  if (messageLength === 0 && channelType === CHANNEL_TYPE.TOPIC) return;

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

    const channels = queriedChannels.map(__transformChannelData);
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
