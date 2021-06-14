const redis = require("redis");
const util = require("util");
const { connectClient } = require("./connect");

module.exports = async (key, value) => {
  try {
    const client = redis.createClient(process.env.REDIS_URL);
    client.on("error", function (error) {
      console.error(error);
    });
    client.set = util.promisify(client.set).bind(client);
    await client.set(key, value);
    await client.expire(key, 300);
    client.ttl(key, redis.print);
  } catch (error) {
    console.log(error);
    throw new Error("Error put data");
  }
};
