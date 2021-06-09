const redis = require("redis");
const util = require("util");

module.exports = async (key) => {
  try {
    const client = redis.createClient();
    client.on("error", function (error) {
      console.error(error);
    });
    client.del = util.promisify(client.del);
    await client.del(key);
  } catch (error) {
    console.log(error);
    throw new Error("Error get data");
  }
};
