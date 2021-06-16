const redis = require("redis");

const client = redis.createClient(process.env.REDIS_URL);

const connectClient = () => {
  return client;
};

module.exports = {
  connectClient,
};
