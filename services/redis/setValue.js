const client = require("./connectionRedis");
const { REDIS_TTL } = require("../../helpers/constants");
const Redis = require('ioredis');
const { REDIS_TTL } = require('../../helpers/constants');
const redis = require('redis');
const util = require('util');
module.exports = async (key, value) => {
  try {
//    client.set(key, value, (err, reply) => {
//      console.log("errr set  ", err, " save : ", reply);
//    });
//    client.expire(key, REDIS_TTL);
    // const client = new Redis(process.env.REDIS_URL, {
    //   tls: {
    //     rejectUnauthorized: false,
    //   },
    // });
    // client.set(key, value);
    // client.expire(key, REDIS_TTL);
    const client = redis.createClient(process.env.REDIS_URL);
    client.on('error', function (error) {
      console.error(error);
    });
    client.set = util.promisify(client.set).bind(client);
    await client.set(key, value);
    await client.expire(key, REDIS_TTL);
    client.ttl(key, redis.print);
  } catch (error) {
    console.log("set ", error);
    // throw new Error("Error put data");
    return null;
  }
};
