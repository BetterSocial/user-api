const Redis = require('ioredis');

const IS_LOCAL_REDIS = false;
const redisConfig = IS_LOCAL_REDIS
  ? {}
  : {
      tls: {
        rejectUnauthorized: false
        // requestCert: true,
        // agent: false
      }
    };

const redisClient = new Redis(String(process.env.REDIS_TLS_URL), redisConfig);

const bullConfig = IS_LOCAL_REDIS
  ? {}
  : {
      tls: {
        rejectUnauthorized: false
        // requestCert: true
      }
    };

module.exports = {
  redisClient,
  bullConfig
};
