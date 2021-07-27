const Bull = require('bull');

const postTimeQueue = new Bull('addQueuePostTime', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

module.exports = {
  postTimeQueue
}

