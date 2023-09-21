const stream = require('getstream');
const ConnectGetstream = stream.connect(
  process.env.API_KEY,
  process.env.SECRET,
  process.env.APP_ID
);

module.exports = ConnectGetstream;
