const {StreamChat} = require('stream-chat');

const syncUser = async (userId) => {
  const serverClient = new StreamChat(process.env.API_KEY, process.env.SECRET);
  const res = await serverClient.upsertUsers([
    {
      id: userId,
      role: 'user'
    }
  ]);
};

module.exports = syncUser;
