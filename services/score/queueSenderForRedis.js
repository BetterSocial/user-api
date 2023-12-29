const Bull = require('bull');
const {v4: uuidv4} = require('uuid');
const {bullConfig, redisUrl} = require('../../config/redis');
const {QUEUE_REMOVE_ACTIVITY, QUEUE_UNFOLLOW_FEED_PROCESS} = require('./constant');

const connectRedis = redisUrl;

const removeActivityQueue = new Bull(QUEUE_REMOVE_ACTIVITY, connectRedis, {
  redis: {
    ...bullConfig,
    maxRetriesPerRequest: 100,
    connectTimeout: 30000
  }
});

const unFollowFeedProcessQueue = new Bull(QUEUE_UNFOLLOW_FEED_PROCESS, connectRedis, {
  redis: {
    ...bullConfig,
    maxRetriesPerRequest: 100,
    connectTimeout: 30000
  }
});

// init the scoring process queue object, to be used on sending message to the queue
const scoringProcessQueue = new Bull('scoringProcessQueue', connectRedis, {
  redis: {
    ...bullConfig,
    maxRetriesPerRequest: 100,
    connectTimeout: 30000
  }
});
scoringProcessQueue.on('error', (err) => {
  console.log('scoringProcessQueue', err);
});

const sendQueue = async (event, data) => {
  console.log(
    `queueSenderForRedis.sendQueue called with event[${event}] and data [${JSON.stringify(data)}]`
  );
  const queueData = {
    event,
    data
  };
  const options = {
    jobId: uuidv4(),
    removeOnComplete: true
  };
  scoringProcessQueue.add(queueData, options);
};

module.exports = {
  sendQueue,
  removeActivityQueue,
  unFollowFeedProcessQueue
};
