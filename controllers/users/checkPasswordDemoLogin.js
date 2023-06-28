const BetterSocialCore = require('../../services/bettersocial');

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const checkPasswordDemoLogin = async (req, res) => {
  const {password} = req.body;
  try {
    const isValidPassword = BetterSocialCore.user.checkPasswordForDemoLogin(password);

    if (isValidPassword) {
      return res.json({
        code: 200,
        message: 'Password is valid'
      });
    }

    return res.status(400).json({
      code: 400,
      message: 'Password is invalid'
    });
  } catch (e) {
    return res.status(400).json({
      code: 400,
      message: e?.message
    });
  }
};

module.exports = checkPasswordDemoLogin;
