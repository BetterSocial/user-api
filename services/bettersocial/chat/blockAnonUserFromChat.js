const {StreamChat} = require('stream-chat');
const Getstream = require('../../../vendor/getstream');

const BetterSocialBlockAnonUserFromChat = async (token, selfUserId, targetUserId) => {
  const chatClient = new StreamChat(process.env.API_KEY, process.env.SECRET);
  await chatClient.upsertUser({
    id: selfUserId,
    role: 'moderator',
    channel_role: 'channel_moderator'
  });

  await chatClient.connectUser({id: selfUserId}, token);

  try {
    /**
     * @type {Channel}
     */
    const channel = await Getstream.chat.findPmChannel(chatClient, selfUserId, targetUserId);

    await channel.updatePartial({
      set: {
        is_channel_blocked: true
      }
    });

    await Getstream.chat.sendSystemMessageForTokenHolder(
      chatClient,
      token,
      channel?.id,
      'You blocked this contact',
      {
        system_message_type: 'block_anon_user'
      }
    );
  } catch (e) {
    console.log('Error in block user v2');
    console.log(e);
    chatClient.disconnectUser();
  }
};

module.exports = BetterSocialBlockAnonUserFromChat;
