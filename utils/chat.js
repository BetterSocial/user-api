const UsersFunction = require('../databases/functions/users');
const {sequelize} = require('../databases/models');
const {MESSAGE_TYPE} = require('../helpers/constants');
const ErrorResponse = require('./response/ErrorResponse');

const determineMessageType = (messageType, attachments) => {
  if (attachments && attachments.length) return MESSAGE_TYPE.MEDIA;
  if (messageType) return messageType;
  return MESSAGE_TYPE.TEXT;
};

/**
 *
 * @param {import('stream-chat').MessageResponse} message
 */
const generateReplyDataFromMessage = (message, userData, isAnonimous = true) => {
  const anonymousName = `Anonymous ${userData?.anon_user_info_emoji_name}`;

  const baseReplyData = {
    user: {
      ...message.user,
      id: message.user_id,
      name: isAnonimous ? anonymousName : userData.username,
      image: isAnonimous ? '' : userData.profile_pic_path,
      username: isAnonimous ? anonymousName : userData.username,
      anon_user_info_emoji_name: userData?.anon_user_info_emoji_name,
      anon_user_info_emoji_code: userData?.anon_user_info_emoji_code,
      anon_user_info_color_name: userData?.anon_user_info_color_name,
      anon_user_info_color_code: userData?.anon_user_info_color_code
    },
    message_type: message.message_type || MESSAGE_TYPE.REGULAR
  };

  if (message.type === 'deleted') {
    return {
      ...baseReplyData,
      message_type: MESSAGE_TYPE.DELETED,
      message: 'This message is deleted'
    };
  }

  const {id, type, created_at, updated_at} = message || {};

  return {
    id,
    type,
    created_at,
    updated_at,
    ...baseReplyData
  };
};

const processReplyMessage = async ({
  res,
  channelId,
  messageType,
  replyMessageId,
  client,
  baseMessage
}) => {
  if (messageType === MESSAGE_TYPE.REPLY) {
    if (!replyMessageId) return ErrorResponse.e403(res, 'Reply message id is required');

    const replyMessage = await client.getMessage(replyMessageId);
    if (!replyMessage) return ErrorResponse.e403(res, 'Message not found');

    const replyMessageActorId = replyMessage.message?.user?.id;

    const replyMessageActorModels = await UsersFunction.getAllChatAnonimityUserInfo(
      sequelize,
      channelId,
      [replyMessageActorId]
    );

    const replyMessageActorModel = replyMessageActorModels?.[0];

    const replyData = generateReplyDataFromMessage(
      replyMessage.message,
      replyMessageActorModel,
      replyMessageActorModel?.is_anonymous
    );

    baseMessage.reply_data = replyData;
    baseMessage.quoted_message_id = replyMessageId;

    return baseMessage;
  }
};

module.exports = {
  determineMessageType,
  generateReplyDataFromMessage,
  processReplyMessage
};
