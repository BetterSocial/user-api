const { User } = require("../../databases/models");
const getstreamService = require("../../services/getstream");
const jwt = require("jsonwebtoken");
const { createRefreshToken } = require("../../services/jwt");

module.exports = async (req, res) => {
  try {
    const userData = await User.findOne({
      where: { human_id: req.body.user_id },
    });
    let user_id = userData.user_id;
    let userId = user_id.toLowerCase();
    const token = await getstreamService.createToken(userId);
    const refresh_token = await createRefreshToken(userId);
    return res.json({
      code: 200,
      data: Object.keys(userData).length === 0 ? false : true,
      message: "",
      token: token,
      refresh_token: refresh_token,
    });
  } catch (error) {
    // const { status, data } = error.response;
    // return res.json({
    //   code: status,
    //   data: 0,
    //   message: data,
    // });
    return res.status(200).json({
      code: 500,
      data: false,
      message: error,
    });
  }
};
