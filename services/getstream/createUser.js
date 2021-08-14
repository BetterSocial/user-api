const stream = require('getstream');
const client = stream.connect(process.env.API_KEY, process.env.SECRET);
module.exports = async (data, userId) => {
  client
    .user(userId)
    .create(data)
    .then((result) => {
      console.log(result);
      return result;
    })
    .catch((err) => {
      throw err;
    });
};
