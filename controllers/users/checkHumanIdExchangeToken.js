const ErrorResponse = require('../../utils/response/ErrorResponse');

const SuccessResponse = require('../../utils/response/SuccessResponse');

const HumanIdService = require('../../vendor/humanid');

const {User} = require('../../databases/models');

const UsersFunction = require('../../databases/functions/users');
const Getstream = require('../../vendor/getstream');

const {createRefreshToken} = require('../../services/jwt');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const checkHumanIdExchangeToken = async (req, res) => {
  const {token} = req?.body || {};
  if (!token) {
    return ErrorResponse.e500(res, 'Token is required');
  }

  const verifyTokenResponse = await HumanIdService.verifyExchangeToken(token);
  if (verifyTokenResponse.success) {
    const {data} = verifyTokenResponse || {};
    const {appUserId} = data || {};

    if (!appUserId) return ErrorResponse.e500(res, 'App user id is required');

    const user = await UsersFunction.findUserByHumanId(User, appUserId);
    if (!user)
      return SuccessResponse(res, {
        code: 500,
        data: false,
        message: 'User not found',
        is_banned: false,
        humanIdData: data
      });

    if (user?.is_banned) return ErrorResponse.e400(res, 'User has banned by admin');
    if (user?.verified_status === 'UNVERIFIED') {
      return SuccessResponse(res, {
        code: 500,
        data: false,
        message: 'User is UNVERIFIED'
      });
    }

    const anonymousUser = await UsersFunction.findAnonymousUserId(User, user?.user_id);
    const userId = user?.user_id?.toLowerCase();
    const userToken = Getstream.core.createToken(userId);
    const anonymousUserToken = Getstream.core.createToken(anonymousUser?.user_id?.toLowerCase());
    const refreshToken = await createRefreshToken(userId);

    return SuccessResponse(res, {
      code: 200,
      data: Object.keys(user).length !== 0,
      message: '',
      is_banned: false,
      token: userToken,
      anonymousToken: anonymousUserToken,
      refresh_token: refreshToken
    });
  }

  return ErrorResponse.e500(res, verifyTokenResponse.message);
};

module.exports = checkHumanIdExchangeToken;
