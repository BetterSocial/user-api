// const client = require("./connectionRedis");
// const Redis = require('ioredis');
const redis = require('redis');
const util = require('util');
module.exports = async (key) => {
  // try {
  //   console.log(process.env.REDIS_URL);
  //   const client = new Redis(process.env.REDIS_URL, {
  //     tls: {
  //       rejectUnauthorized: false,
  //     },
  //   });
  //   return client.get(key, function (err, result) {
  //     if (err) {
  //       console.error(err);
  //       return null;
  //     } else {
  //       return result;
  //     }
  //   });
  // } catch (error) {
  //   console.log(error);
  //   return null;
  // }
  try {
    //    return client.get(key, function (err, result) {
    //      if (err) {
    //        return null;
    //      } else {
    //        return result;
    //      }
    //    });
    const client = redis.createClient(process.env.REDIS_URL);
    client.on('error', function (error) {
      console.error(error);
    });
    client.get = util.promisify(client.get);
    return await client.get(key);
  } catch (error) {
    console.log(error);
    throw new Error('Error get data');
  }
};
