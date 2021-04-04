const { User } = require("../../databases/models");
const getstreamService = require("../../services/getstream");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  try {
    const user = await User.count({ where: { human_id: req.body.user_id } });
    const userData = await User.findOne({
      where: { human_id: req.body.user_id },
    });
    let userId = userData.user_id;
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
      data: user,
      message: "",
      token: token,
      refresh_token: refresh_token,
    });
  } catch (error) {
    // const { status, data } = error.response;
    // console.log(error);
    // return res.json({
    //   code: status,
    //   data: 0,
    //   message: data,
    // });
    return res.status(500).json({
      code: 500,
      data: 0,
      message: error,
    });
  }
};
