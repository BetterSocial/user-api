const UsersFunction = require('../../databases/functions/users');

const {User} = require('../../databases/models');
const {createRefreshToken} = require('../../services/jwt');
const Getstream = require('../../vendor/getstream');
const HumanIdService = require('../../vendor/humanid');

/**
 *
 * @param {import("express").Request} req
 * @param {Response} res
 */
const authenticateWeb = async (req, res) => {
  let token;
  let refresh_token;
  let anonymousToken;

  /**
   * @type {RegisterBody}
   */
  const {exchangeToken} = req.body;

  const verifyTokenResponse = await HumanIdService.verifyExchangeToken(exchangeToken);
  if (!verifyTokenResponse.success) {
    return res.status(500).json({
      status: 'error on verify exchange token',
      code: 500
    });
  }

  const {data} = verifyTokenResponse || {};
  const {appUserId} = data || {};

  if (!appUserId) {
    return res.status(500).json({
      status: 'App user id is required',
      code: 500
    });
  }

  const checkUser = await UsersFunction.findUserByHumanId(User, appUserId);

  let insertedObject = {};

  if (checkUser) {
    insertedObject = {
      user: checkUser,
      anonymousUser: await UsersFunction.findAnonymousUserId(User, checkUser.user_id, {
        raw: false
      })
    };
  } else {
    return res.status(500).json({
      status: 'Human id is not found',
      code: 500
    });
  }

  /**
   * Creating User to Getstream
   */
  try {
    token = Getstream.core.createToken(insertedObject?.user?.user_id);
    anonymousToken = Getstream.core.createToken(
      insertedObject?.anonymousUser?.user_id?.toLowerCase()
    );
  } catch (e) {
    console.log('error on inserting user to getstream creating', e);
    return res.status(500).json({
      status: 'error on inserting user to getstream creating',
      code: 500,
      message: e
    });
  }
  try {
    refresh_token = await createRefreshToken(insertedObject?.user?.user_id);
  } catch (e) {
    console.log('error on inserting user to getstream creating refresh token', e);
    return res.status(500).json({
      status: 'error on inserting user to getstream creating refresh token',
      code: 500,
      message: e
    });
  }
  /**
   * Creating User to Getstream (END)
   */

  return res.status(200).json({
    status: 'success',
    code: 200,
    data: insertedObject?.user,
    anonymousToken,
    token,
    refresh_token
  });
};

module.exports = authenticateWeb;
