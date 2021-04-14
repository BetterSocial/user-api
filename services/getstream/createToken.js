const stream = require("getstream");
const moment = require("moment");
const client = stream.connect(process.env.API_KEY, process.env.SECRET);
module.exports = async (userId) => {
  let id = userId.toLowerCase();
  let exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  return client.createUserToken(id, { exp: exp });
};
