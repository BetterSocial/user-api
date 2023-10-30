const Validator = require('fastest-validator');
const {StreamChat} = require('stream-chat');
const {responseError, responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE} = require('../../helpers/constants');

const v = new Validator();

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const sendSignedMesage = async (req, res) => {
  const schema = {
    channelId: 'string|empty:false',
    message: 'string|empty:false',
    channelType: 'number|empty:false'
  };
  const validated = v.validate(req.body, schema);
  if (validated.length)
    return res.status(403).json({
      message: 'Error validation',
      error: validated
    });

  const {channelId, message, channelType} = req.body;

  let channelTypeDef;

  switch (channelType) {
    case CHANNEL_TYPE.CHAT:
      channelTypeDef = 'messaging';
      break;

    case CHANNEL_TYPE.GROUP:
      channelTypeDef = 'group';
      break;

    default:
      break;
  }

  if (!channelTypeDef)
    return res.status(403).json({
      message: 'Error validation',
      error: 'Channel type not found'
    });

  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  try {
    await client.connectUser({id: req.userId}, req.token);

    const channel = client.channel(channelTypeDef, channelId);

    const createdChannel = await channel.create();

    if (createdChannel?.channel?.is_channel_blocked)
      return res.status(403).json(responseError('Channel is blocked'));

    const chat = await channel.sendMessage({
      user_id: req.userId,
      text: message,
      ...req.body
    });

    await client.disconnectUser();
    return res.status(200).json(responseSuccess('sent', chat));
  } catch (error) {
    await client.disconnectUser();
    return res.status(error.statusCode ?? error.status ?? 400).json({
      status: 'error',
      code: error.statusCode ?? error.status ?? 400,
      message: error.message
    });
  }
};

module.exports = sendSignedMesage;
