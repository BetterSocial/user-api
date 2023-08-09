const {StreamChat} = require('stream-chat');

const deleteChat = async (req, res) => {
  const client = new StreamChat(process.env.API_KEY, process.env.SECRET_KEY);
  const {channelId} = req.params;

  try {
    await client.connectUser(
      {
        id: req.userId
      },
      req.token
    );

    const channel = client.channel('messaging', channelId);
    const destroy = await channel.delete();

    if (!destroy) {
      return res.status(500).json({message: 'Error deleting chat'});
    }

    return res.status(200).json({message: 'Chat deleted'});
  } catch (e) {
    console.log(e);
    return res.status(500).json({message: 'Error connecting to chat'});
  }
};

module.exports = deleteChat;
