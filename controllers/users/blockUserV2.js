const BetterSocialCore = require('../../services/bettersocial');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const blockUserV2 = async (req, res) => {
  const {userId: selfUserId, token} = req;
  const {userId: targetUserId, source, postId, reason, message} = req.body;

  const response = await BetterSocialCore.user.blockUser(token, selfUserId, targetUserId, source, {
    postId,
    message,
    reason
  });
  if (response?.isSuccess)
    return SuccessResponse(res, {}, response?.message || 'User has been blocked successfully');

  return ErrorResponse.e500(res, response?.message || 'Error in block user v2');
};

module.exports = blockUserV2;
