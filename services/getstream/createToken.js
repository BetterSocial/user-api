const stream = require("getstream");
const client = stream.connect(process.env.API_KEY, process.env.SECRET);
module.exports = async (userId) => {
  return client.createUserToken(userId);
};
