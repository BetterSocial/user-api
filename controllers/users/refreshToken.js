const getstreamService = require("../../services/getstream");
const jwt = require("jsonwebtoken");
const { createRefreshToken } = require("../../services/jwt");

module.exports = async (req, res) => {
  let userId = req.userId;

  const token = await getstreamService.createToken(userId);
  const opts = {
    algorithm: "HS256",
    noTimestamp: true,
  };
  const refresh_token = await createRefreshToken(userId);
  return res.json({
    code: 200,
    message: "Success refresh token",
    data: {
      token: token,
      refresh_token: refresh_token,
    },
  });
};
