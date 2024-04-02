const {StreamChat} = require('stream-chat');
const {ResponseSuccess} = require('../../utils/Responses');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const getMessageDetail = async (req, res) => {
  const {messageID} = req.params;

  if (!messageID) {
    return res.status(400).json({
      message: 'Bad request'
    });
  }
  const client = new StreamChat(process.env.API_KEY, process.env.SECRET);
  let message_detail = await client.getMessage(messageID);
  if (!message_detail) {
    return res.status(400).json({
      success: false,
      message: `You do not have permission to access this content, or the content has been deleted`
    });
  }

  return ResponseSuccess(res, 'Success', 200, {
    message: message_detail
  });
};

module.exports = getMessageDetail;
