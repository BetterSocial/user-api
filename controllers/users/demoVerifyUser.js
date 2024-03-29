const {User} = require('../../databases/models');
const getstreamService = require('../../services/getstream');
const {createRefreshToken} = require('../../services/jwt');
const UsersFunction = require('../../databases/functions/users');

module.exports = async (req, res) => {
  if (process.env.IS_DEMO_LOGIN_ENABLED !== 'true') {
    return res.status(200).json({
      success: false,
      message: 'Demo login is disabled'
    });
  }

  try {
    const userData = await User.findOne({
      where: {human_id: req.body.user_id, is_anonymous: false}
    });
    if (userData) {
      if (userData.is_banned) {
        return res.status(401).json({
          code: 401,
          data: false,
          is_banned: true,
          message: 'User has banned by admin'
        });
      }
      if (userData.verified_status !== 'VERIFIED') {
        return res.status(401).json({
          code: 401,
          data: false,
          is_verified: true,
          message: 'User is not verified'
        });
      }

      let user_id = userData.user_id;
      let userId = user_id.toLowerCase();
      const anonUser = await UsersFunction.findAnonymousUserId(User, user_id);
      const anonymousToken = await getstreamService.createToken(anonUser.user_id);
      const token = await getstreamService.createToken(userId);
      const refresh_token = await createRefreshToken(userId);
      return res.json({
        code: 200,
        data: Object.keys(userData).length === 0 ? false : true,
        message: '',
        token: token,
        refresh_token: refresh_token,
        anonymousToken: anonymousToken,
        is_banned: false
      });
    } else {
      return res.status(200).json({
        code: 500,
        data: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      code: 500,
      data: false,
      message: error
    });
  }
};
