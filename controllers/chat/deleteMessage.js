const {StreamChat} = require('stream-chat');
const {MESSAGE_TYPE} = require('../../helpers/constants');

const client = new StreamChat(process.env.API_KEY, process.env.SECRET_KEY);
const deleteMessage = async (req, res) => {
  const {messageID} = req.params;

  try {
    await client.connectUser(
      {
        id: req.userId
      },
      req.token
    );
    let message = await client.getMessage(messageID);
    let channelId = message?.message?.channel?.id;

    await client.partialUpdateMessage(messageID, {
      set: {
        message_type: MESSAGE_TYPE.DELETED,
        text: 'This message has been deleted'
      }
    });
    let destroy = await client.deleteMessage(messageID);
    // sent empty message to channel
    let baseMessage = {
      user_id: req.userId,
      message_type: 'deleted',
      deleted_message_id: messageID
    };
    const channel = client.channel('messaging', channelId);
    await channel.sendMessage(baseMessage, {
      skip_push: true
    });

    if (!destroy) {
      return res.status(500).json({message: 'Error deleting chat'});
    }

    return res.status(200).json({message: 'Message deleted'});
  } catch (e) {
    if (e.code === 4) {
      return res.status(404).json({message: 'Message not found'});
    }
    return res.status(500).json({message: 'Error connecting to chat'});
  } finally {
    await client.disconnectUser();
  }
};

module.exports = deleteMessage;
