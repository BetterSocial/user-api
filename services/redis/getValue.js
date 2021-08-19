const client = require("./connectionRedis");
module.exports = async (key) => {
  try {
    return client.get(key, function (err, result) {
      console.log("get data cache ", result);
      if (err) {
        console.error("errror get", err);
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
