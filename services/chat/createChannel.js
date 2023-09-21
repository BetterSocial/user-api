const StreamChat = require('stream-chat').StreamChat;

module.exports = async (channelType, channelId) => {
  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  const channel = client.channel(channelType, channelId, {
    created_by_id: 'e554d0ac-81cc-4139-9939-11de565cda27'
  });
  return channel.create();
};
