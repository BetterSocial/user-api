const {StreamChat} = require('stream-chat');
const {MESSAGE_TYPE} = require('../../helpers/constants');

const deleteMessage = async (req, res) => {
  const client = new StreamChat(process.env.API_KEY, process.env.SECRET_KEY);
  const {messageID} = req.params;

  try {
    await client.connectUser(
      {
        id: req.userId
      },
      req.token
    );
    await client.partialUpdateMessage(messageID, {
      set: {
        message_type: MESSAGE_TYPE.DELETED
      }
    });
    let destroy = await client.deleteMessage(messageID);

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
