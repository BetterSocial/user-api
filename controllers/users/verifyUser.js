const { User } = require("../../databases/models");
const getstreamService = require("../../services/getstream");
const jwt = require("jsonwebtoken");
const { createRefreshToken } = require("../../services/jwt");
const Getstream = require("../../vendor/getstream");

module.exports = async (req, res) => {
  try {
    const userData = await User.findOne({
      where: { human_id: req.body.user_id},
    });
    if (userData) {
      if (userData.is_banned) {
        return res.status(401).json({
          code: 401,
          data: false,
          is_banned: true,
          message: "User has banned by admin",
        });
      }
      await Getstream.core.updateUserRemoveHumanId(userData)
      let user_id = userData.user_id;
      let userId = user_id.toLowerCase();
      const token = await getstreamService.createToken(userId);
      const refresh_token = await createRefreshToken(userId);
      return res.json({
        code: 200,
        data: Object.keys(userData).length === 0 ? false : true,
        message: "",
        is_banned: false,
        token: token,
        refresh_token: refresh_token,
      });
    } else {
      return res.status(200).json({
        code: 500,
        data: false,
        is_banned: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      code: 500,
      data: false,
      is_banned: false,
      message: error,
    });
  }
};
