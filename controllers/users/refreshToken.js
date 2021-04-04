const getstreamService = require("../../services/getstream");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  let userId = req.userId;

  const token = await getstreamService.createToken(userId);
  const opts = {
    algorithm: "HS256",
    noTimestamp: true,
  };
  const payload = { user_id: userId };
  const refresh_token = await jwt.sign(
    payload,
    process.env.SECRET_REFRESH_TOKEN,
    opts
  );
  return res.json({
    code: 200,
    message: "Success refresh token",
    data: {
      token: token,
      refresh_token: refresh_token,
    },
  });
};
