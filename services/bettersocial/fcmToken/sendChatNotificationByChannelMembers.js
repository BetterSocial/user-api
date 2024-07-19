const sendChatNotification = require('./sendChatNotification');

const sendChatNotificationByChannelMembers = async (
  channelMembers = [],
  payload = {},
  options = {}
) => {
  const deduplicatedChannelMembers = [...new Set(channelMembers)];

  deduplicatedChannelMembers.forEach((member) => {
    const newPayload = {
      ...payload,
      data: {
        ...payload.data,
        is_annoymous: member.is_anonymous.toString()
      }
    };
    sendChatNotification(member?.user_id, newPayload, options);
  });
};

module.exports = sendChatNotificationByChannelMembers;
