const BetterSocialCore = require('../../services/bettersocial');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');
const _ = require('lodash');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const checkFollow = async (req, res) => {
  const {userId} = req;
  const {targetUserIds} = req.body;

  const removeDuplicatedUserIds = _.union(targetUserIds);
  const response = await BetterSocialCore.user.checkTargetUserFollowStatusBatch(
    userId,
    removeDuplicatedUserIds
  );
  if (response?.isSuccess) {
    return SuccessResponse(res, response?.targetHashes, 'Check follow status success');
  }

  return ErrorResponse(res, response?.message, 'Check follow status failed');
};

module.exports = checkFollow;
