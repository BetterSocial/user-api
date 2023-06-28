const BetterSocialCore = require('../../services/bettersocial');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const VerifyUserV2Middleware = (req, res, next) => {
  const {password} = req.body;
  const isValid = BetterSocialCore.user.checkPasswordForDemoLogin(password);
  console.log('isVAlid', isValid);
  if (isValid) return next();

  return res.status(400).json({
    code: 403,
    status: 'Password is invalid'
  });
};

module.exports = VerifyUserV2Middleware;
