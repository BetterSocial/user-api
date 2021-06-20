const redis = require("redis");
const util = require("util");

module.exports = async (key) => {
  try {
    const client = redis.createClient(process.env.REDIS_URL);
    client.on("error", function (error) {
      console.error(error);
    });
    client.get = util.promisify(client.get);
    return await client.get(key);
  } catch (error) {
    console.log(error);
    throw new Error("Error get data");
  }
};
