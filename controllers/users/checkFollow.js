const BetterSocialCore = require('../../services/bettersocial');

const ErrorResponse = require('../../utils/response/ErrorResponse');

const SuccessResponse = require('../../utils/response/SuccessResponse');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const checkFollow = async (req, res) => {
  const {userId} = req;
  const {targetUserId} = req.query;

  if (!targetUserId) return ErrorResponse.e400(res, 'Target user id is required');

  const response = await BetterSocialCore.user.checkTargetUserFollowStatus(userId, targetUserId);
  if (response?.isSuccess)
    return SuccessResponse(
      res,
      {
        isTargetFollowingMe: response?.isTargetFollowingMe,
        isMeFollowingTarget: response?.isMeFollowingTarget,
        isAnonymous: response?.isAnonymous
      },
      'Check follow status successfully'
    );

  return ErrorResponse.e500(res, response?.message);
};

module.exports = checkFollow;
