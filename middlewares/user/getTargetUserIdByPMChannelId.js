const {StreamChat} = require('stream-chat');
const Getstream = require('../../vendor/getstream');

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns
 */
const getTargetUserIdByPMChannelIdMiddleware = async (req, res, next) => {
  const {userId} = req || {};
  const {channelId} = req?.query || {};

  if (!channelId) {
    return res.status(400).json({
      code: 400,
      success: false,
      message: 'Channel ID is required'
    });
  }

  const chatClient = new StreamChat(process.env.API_KEY, process.env.SECRET);
  let channelMembers;
  try {
    let {users} = await Getstream.chat.getTargetUserIdByChannelId(chatClient, userId, channelId);
    channelMembers = users;
  } catch (e) {
    console.error('Failed to get channel members', e);
    return res.status(500).json({
      code: 500,
      success: false,
      message: 'Internal server error'
    });
  }

  if (!channelMembers || channelMembers?.length !== 1)
    return res.status(400).json({
      code: 400,
      success: false,
      message: 'Not a valid PM channel'
    });

  const targetUserId = channelMembers?.at(0)?.user_id;

  if (!targetUserId)
    return res.status(400).json({
      code: 400,
      success: false,
      message: "The user on this channel doesn't have a valid user id"
    });
  req.query.targetUserId = targetUserId;

  return next();
};

module.exports = getTargetUserIdByPMChannelIdMiddleware;
