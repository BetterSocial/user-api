const Validator = require('fastest-validator');
const {StreamChat} = require('stream-chat');
const {responseError, responseSuccess} = require('../../utils/Responses');
const {MESSAGE_TYPE} = require('../../helpers/constants');
const {determineMessageType, processReplyMessage} = require('../../utils/chat');

const v = new Validator();
const sendAnonymousMessage = async (req, res) => {
  const schema = {
    channelId: 'string|empty:false',
    message: 'string|empty:false',
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

  const {channelId, message, attachments, messageType, replyMessageId} = req.body;

  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  try {
    await client.connectUser({id: req.userId}, req.token);

    const channel = client.channel('messaging', channelId);

    const createdChannel = await channel.create();

    if (
      req.user.is_anonymous &&
      createdChannel.channel.anon_user_info_emoji_name &&
      client.user.name !== `Anonymous ${createdChannel.channel.anon_user_info_emoji_name}`
    ) {
      await client.upsertUser({
        id: req.userId,
        name: `Anonymous ${createdChannel.channel.anon_user_info_emoji_name}`,
        image: createdChannel.channel.anon_user_info_emoji_code,
        username: `Anonymous ${createdChannel.channel.anon_user_info_emoji_name}`
      });
    }
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
    return res.status(error.statusCode ?? error.status ?? 400).json({
      status: 'error',
      code: error.statusCode ?? error.status ?? 400,
      message: error.message
    });
  }
};

module.exports = sendAnonymousMessage;
