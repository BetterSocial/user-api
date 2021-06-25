const Bull = require('bull');

const addQueuePostTime = new Bull('addQueuePostTime', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const updateQueuePostTime = new Bull('updateQueuePostTime', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

module.exports = {
  addQueuePostTime, updateQueuePostTime
}

