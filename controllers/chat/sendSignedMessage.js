const Validator = require('fastest-validator');
const {StreamChat} = require('stream-chat');
const {responseError, responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE, MESSAGE_TYPE} = require('../../helpers/constants');
const Environment = require('../../config/environment');
const {determineMessageType, processReplyMessage} = require('../../utils/chat');
const UsersFunction = require('../../databases/functions/users');
const {UserBlockedUser} = require('../../databases/models');
const BetterSocialCore = require('../../services/bettersocial');

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

  let {channelId, message, channelType, attachments, messageType, replyMessageId} = req.body;

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

    let channelMember = [];
    let senderInfo = [];
    // Prevent if user try to chat with blocked user
    let channelType = createdChannel?.channel?.channel_type || req.body.channelType || 0;
    if (channelType === 4 || channelType === 0) {
      const blockedIds = await UsersFunction.getBlockedAndBlockerUserId(
        UserBlockedUser,
        req.userId
      );
      let better_channel_member = createdChannel?.channel?.better_channel_member;
      const blockedIdsSet = new Set(blockedIds);
      const isBlocked = better_channel_member.some(
        (member) => member.user_id !== req.userId && blockedIdsSet.has(member.user_id)
      );
      if (isBlocked) {
        return res.status(403).json(responseError('This user does not want to receive messages'));
      }

      channelMember = better_channel_member.filter(
        (element) => element.user_id !== req.userId && !blockedIdsSet.has(element.user_id)
      );

      senderInfo = better_channel_member.find((element) => element.user_id === req.userId);
    }

    // Send PN to all members in group chat except sender
    if (channelType === 1) {
      let better_channel_member = createdChannel?.members;
      channelMember = better_channel_member.filter((element) => element.user_id !== req.userId);
      senderInfo = better_channel_member.find((element) => element.user_id === req.userId);
    }

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

    let chat = await channel.sendMessage(baseMessage, {skip_push: true});
    let notificationPayload = {
      title: `${senderInfo?.user?.username}`,
      body: `${message.substring(0, 100)}`
    };

    if (chat && chat.message?.message_type === MESSAGE_TYPE.TEXT) {
      chat.message.attachments = [];
      attachments = [];
    }

    let dataPayload = {
      channel_id: channelId,
      user_id: req.userId,
      messages_id: chat.message.id,
      message,
      message_schema: currentMessageType,
      type: 'message.new',
      status: 'sent',
      is_big_message: 'false',
      attachment: JSON.stringify(attachments) ?? '',
      created_at: chat.message.created_at,
      is_annoymous: 'false',
      priority: 'high',
      content_available: 'true'
    };
    const dataSizeInBytes = Buffer.byteLength(JSON.stringify(dataPayload), 'utf8');
    const dataSizeInKilobytes = dataSizeInBytes / 1024;
    if (dataSizeInKilobytes > 4) {
      dataPayload.is_big_message = 'true';
      dataPayload.attachment = '';
    }

    BetterSocialCore.fcmToken
      .sendChatNotificationByChannelMembers(
        channelMember,
        {
          notification: notificationPayload,
          data: dataPayload
        },
        {
          priority: 'high',
          content_available: true
        }
      )
      .catch((e) => {
        console.log('error send chat notification', e.code);
      });

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
