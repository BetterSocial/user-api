const Validator = require('fastest-validator');
const {StreamChat} = require('stream-chat');
const {responseError, responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE, MESSAGE_TYPE} = require('../../helpers/constants');
const Environment = require('../../config/environment');
const {determineMessageType, processReplyMessage} = require('../../utils/chat');

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
    channelType: {
      type: 'enum',
      values: Object.values(CHANNEL_TYPE),
      empty: false
    },
    messageType: {
      type: 'enum',
      values: Object.values(MESSAGE_TYPE),
      empty: true,
      nullable: true,
      optional: true
    },
    replyMessageId: 'string|empty:true|nullable:true|optional:true',
    attachments: {
      type: 'array',
      optional: true,
      nullable: true,
      empty: true,
      items: {
        type: 'object',
        props: {
          type: 'string',
          asset_url: 'string',
          thumb_url: 'string',
          myCustomField: 'string'
        }
      }
    }
  };
  const validated = v.validate(req.body, schema);
  if (validated.length)
    return res.status(403).json({
      message: 'Error validation',
      error: validated
    });

  const {channelId, message, channelType, attachments, messageType, replyMessageId} = req.body;

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

  const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRET);
  try {
    await client.connectUser({id: req.userId}, req.token);

    const channel = client.channel(channelTypeDef, channelId);

    const createdChannel = await channel.create();

    if (createdChannel?.channel?.is_channel_blocked)
      return res.status(403).json(responseError('Channel is blocked'));

    const currentMessageType = determineMessageType(messageType, attachments);
    let baseMessage = {
      user_id: req.userId,
      attachments,
      message_type: currentMessageType,
      text: message
    };

    if (messageType === MESSAGE_TYPE.REPLY) {
      baseMessage = await processReplyMessage({
        res,
        baseMessage,
        channelId,
        client,
        messageType,
        replyMessageId
      });
    }

    const chat = await channel.sendMessage(baseMessage);

    await client.disconnectUser();
    return res.status(200).json(responseSuccess('sent', chat));
  } catch (error) {
    await client.disconnectUser();
    return res.status(error.statusCode ?? error.status ?? 500).json({
      status: 'error',
      code: error.statusCode ?? error.status ?? 500,
      message: error.message
    });
  }
};

module.exports = sendSignedMesage;
