const BetterSocialCore = require('../../services/bettersocial');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const unblockUserV2 = async (req, res) => {
  const {userId: selfUserId, token} = req;
  const {userId: targetUserId} = req.body;

  const response = await BetterSocialCore.user.unblockUser(token, selfUserId, targetUserId);
  if (response?.isSuccess)
    return SuccessResponse(res, {}, response?.message || 'User has been unblocked successfully');

  return ErrorResponse.e500(res, response?.message || 'Error in unblock user v2');
};

module.exports = unblockUserV2;
