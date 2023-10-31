const {CHANNEL_TYPE} = require('../../helpers/constants');
const GetstreamSingleton = require('../../vendor/getstream/singleton');

const setSignedChannelAsRead = async (req, res) => {
  const {channelType, channelId} = req.body;
  let channelTypeDef;

  switch (channelType) {
    case CHANNEL_TYPE.CHAT:
    case CHANNEL_TYPE.ANONYMOUS:
      channelTypeDef = 'messaging';
      break;

    case CHANNEL_TYPE.GROUP:
      channelTypeDef = 'group';
      break;

    default:
      return res.status(403).json({
        message: 'Error validation',
        error: 'Channel type not found'
      });
  }

  const client = GetstreamSingleton.getChatInstance();
  try {
    await client.connectUser({id: req.userId}, req.token);

    const channel = client.channel(channelTypeDef, channelId);

    await channel.watch();

    const readed = await channel.markRead();

    await client.disconnectUser();
    return res.status(200).json({data: readed});
  } catch (error) {
    await client.disconnectUser();
    return res.status(error.statusCode ?? error.status ?? 400).json({
      status: 'error',
      code: error.statusCode ?? error.status ?? 400,
      message: error.message
    });
  }
};

module.exports = setSignedChannelAsRead;
