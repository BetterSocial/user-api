const Redis = require("ioredis");
const { REDIS_TTL } = require("../../helpers/constants");
module.exports = async (key, value) => {
  try {
    const client = new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false,
      },
    });
    client.set(key, value);
    client.expire(key, REDIS_TTL);
    // const client = redis.createClient(process.env.REDIS_URL);
    // client.on("error", function (error) {
    //   console.error(error);
    // });
    // client.set = util.promisify(client.set).bind(client);
    // await client.set(key, value);
    // await client.expire(key, REDIS_TTL);
    // client.ttl(key, redis.print);
  } catch (error) {
    console.log(error);
    // throw new Error("Error put data");
    return null;
  }
};
