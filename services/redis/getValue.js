const client = require("./connectionRedis");
module.exports = async (key) => {
  try {
    return client.get(key, function (err, result) {
      if (err) {
        return null;
      } else {
        return result;
      }
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};
