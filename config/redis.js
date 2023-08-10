const Redis = require('ioredis');

const redisUrl = process.env.REDIS_ENTERPRISE_URL;
const redisConfig = {};

const redisClient = new Redis(String(redisUrl), redisConfig);
const bullConfig = {};

module.exports = {
  redisClient,
  bullConfig,
  redisUrl
};
