const stream = require('getstream');
const client = stream.connect(process.env.API_KEY, process.env.SECRET);

module.exports = async (userId, data) => {
  client
    .user(userId)
    .update(data)
    .then((result) => {
      return result;
    })
    .catch((err) => {
      return err;
    });
};
