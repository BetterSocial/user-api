const ErrorResponse = require('../../utils/response/ErrorResponse');
const BetterSocialCore = require('../../services/bettersocial');

const isTargetUserAllowingAnonDMMiddleware = async (req, res, next) => {
  const {members} = req?.body || {};

  if (!members) return ErrorResponse.e400(res, 'Members is required');
  if (members.length < 1) return ErrorResponse.e400(res, 'Members cannot be empty');

  const targetMember = members[0];
  try {
    await BetterSocialCore.user.checkIsTargetAllowingAnonDM(req?.userId, targetMember);
  } catch (e) {
    return ErrorResponse.e400(res, e.message);
  }
  return next();
};

module.exports = isTargetUserAllowingAnonDMMiddleware;
