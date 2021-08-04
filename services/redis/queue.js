const Bull = require('bull');

const postTimeQueue = new Bull('addQueuePostTime', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const followLocationQueue = new Bull('followLocationQueue', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const followUserQueue = new Bull('followUserQueue', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const followTopicQueue = new Bull('followTopicQueue', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

module.exports = {
  postTimeQueue,
  followLocationQueue,
  followUserQueue,
  followTopicQueue,
};
