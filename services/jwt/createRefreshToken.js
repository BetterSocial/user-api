const jwt = require('jsonwebtoken');

module.exports = async (userId) => {
  const opts = {
    algorithm: 'HS256',
    noTimestamp: true
  };
  const payload = {
    user_id: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  };
  const refresh_token = jwt.sign(payload, process.env.SECRET_REFRESH_TOKEN, opts);
  return refresh_token;
};
