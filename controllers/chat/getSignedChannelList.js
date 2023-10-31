const {responseSuccess} = require('../../utils/Responses');
const GetstreamSingleton = require('../../vendor/getstream/singleton');

const __queryChannelBuilder = async (userId, limit, offset) => {
  console.log('querying channel', limit, offset);
  const client = GetstreamSingleton.getChatInstance();
  const channels = await client.queryChannels({members: {$in: [userId]}}, [{last_message_at: -1}], {
    limit: limit,
    offset: offset,
    state: true
  });
  await client.disconnectUser();
  return channels;
};

const getSignedChannelList = async (req, res) => {
  const {userId} = req;
  const {limit = 100, offset = 0} = req.query;

  let totalFetched = 0;
  const queriedChannels = [];
  const promisedChannels = [];

  const client = GetstreamSingleton.getChatInstance();
  try {
    await client.connectUser({id: req.userId}, req.token);

    while (totalFetched < limit) {
      const batchSize = Math.min(30, limit - totalFetched);
      promisedChannels.push(
        __queryChannelBuilder(userId, batchSize, Number(totalFetched) + Number(offset))
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

    await client.disconnectUser();
    const channels = queriedChannels.map((channel) => {
      const newChannel = {...channel.data};
      delete newChannel.config;
      delete newChannel.own_capabilities;

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
    });
    return res.status(200).json(responseSuccess('Success retrieve channels', channels));
  } catch (error) {
    await client.disconnectUser();
    return res.status(error.statusCode ?? error.status ?? 400).json({
      status: 'error',
      code: error.statusCode ?? error.status ?? 400,
      message: error.message
    });
  }
};

module.exports = getSignedChannelList;
