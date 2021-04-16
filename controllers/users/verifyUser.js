const { User } = require("../../databases/models");
const getstreamService = require("../../services/getstream");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  try {
    const userData = await User.findOne({
      where: { human_id: req.body.user_id },
    });
    let userId = userData.user_id;
    let userId = userId.toLowerCase();
    const token = await getstreamService.createToken(userId);
    const opts = {
      algorithm: "HS256",
      noTimestamp: true,
    };
    const payload = {
      user_id: userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };
    const refresh_token = await jwt.sign(
      payload,
      process.env.SECRET_REFRESH_TOKEN,
      opts
    );
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
