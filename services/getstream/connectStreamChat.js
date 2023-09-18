const StreamChat = require('stream-chat').StreamChat;

const connectStreamChat = async (userId, token) => {
  const client = StreamChat.getInstance(process.env.API_KEY, process.env.APP_ID);
  await client.disconnectUser();
  client.connectUser(
    {
      id: userId
    },
    token
  );
  return client;
};
module.exports = {
  connectStreamChat
};
