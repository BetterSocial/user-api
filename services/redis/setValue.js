const client = require('./connectionRedis');
const {REDIS_TTL} = require('../../helpers/constants');
module.exports = async (key, value) => {
  try {
    client.set(key, value, (err, reply) => {
      console.log('errr set  ', err, ' save : ', reply);
    });
    client.expire(key, REDIS_TTL);
  } catch (error) {
    console.log('set ', error);
    // throw new Error("Error put data");
    return null;
  }
};
