const redis = require("redis");

const client = redis.createClient();

const connectClient = () => {
  return client;
};

module.exports = {
  connectClient,
};
