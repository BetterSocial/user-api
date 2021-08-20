const client = require("./connectionRedis");
// const Redis = require('ioredis');
// module.exports = async (key) => {
//   try {
//     const client = new Redis(process.env.REDIS_URL, {
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });
//     await client.del(key);
//   } catch (error) {
//     console.log(error);
//     throw new Error('Error get data');
//   }
// };

const redis = require('redis');
const util = require('util');

module.exports = async (key) => {
  try {
    const client = redis.createClient(process.env.REDIS_URL);
    client.on('error', function (error) {
      console.error(error);
    });
    client.del = util.promisify(client.del);
    await client.del(key);
  } catch (error) {
    console.log(error);
    throw new Error('Error get data');
  }
};
