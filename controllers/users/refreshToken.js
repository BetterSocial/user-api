const {User} = require('../../databases/models');
const UsersFunction = require('../../databases/functions/users');
const getstreamService = require('../../services/getstream');
const {createRefreshToken} = require('../../services/jwt');
const Getstream = require('../../vendor/getstream');

module.exports = async (req, res) => {
  const {userId} = req;

  let anonymousToken;

  try {
    const anonymousUser = await UsersFunction.findAnonymousUserId(User, userId);
    anonymousToken = Getstream.core.createToken(anonymousUser?.user_id);
  } catch (e) {
    anonymousToken = null;
    console.log('Error when creating anonymous token');
    console.log(e);
  }

  const token = await getstreamService.createToken(userId);
  const refresh_token = await createRefreshToken(userId);
  return res.json({
    code: 200,
    message: 'Success refresh token',
    data: {
      token,
      refresh_token,
      anonymousToken
    }
  });
};
