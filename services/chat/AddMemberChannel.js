const StreamChat = require('stream-chat').StreamChat;

module.exports = async (channelType, channelId, members = []) => {
  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  const channel = client.channel(channelType, channelId);
  return channel.addMembers(members);
};
