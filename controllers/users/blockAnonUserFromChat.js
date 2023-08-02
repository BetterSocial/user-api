const BetterSocialCore = require('../../services/bettersocial');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const blockAnonUserFromChat = async (req, res) => {
  const {userId: selfUserId, token} = req;
  const {userId: targetUserId, source, postId, reason, message} = req.body;

  try {
    const response = await BetterSocialCore.user.blockUser(
      token,
      selfUserId,
      targetUserId,
      source,
      {
        postId,
        message,
        reason
      }
    );

    if (response?.isSuccess === false)
      return ErrorResponse.e400(res, response?.message || 'Error in block user v2');

    await BetterSocialCore.chat.blockAnonUserFromChat(token, selfUserId, targetUserId);
    return SuccessResponse(res, {}, '' || 'User has been blocked successfully');
  } catch (e) {
    return ErrorResponse.e500(res, e?.message || 'Error in block user v2');
  }
  //   if (true)
};

module.exports = blockAnonUserFromChat;
