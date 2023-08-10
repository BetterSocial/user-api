const Bull = require('bull');
const {v4: uuidv4} = require('uuid');

const {convertingUserFormatForLocation} = require('../../utils/custom');
const {bullConfig, redisUrl} = require('../../config/redis');

const connectRedis = redisUrl;

const registerV2Queue = new Bull('registerV2', connectRedis, {
  redis: {
    ...bullConfig,
    maxRetriesPerRequest: 100,
    connectTimeout: 30000
  }
});

registerV2Queue.on('error', (err) => {
  console.log('error on assigning register v2 queue', err);
});

let registerServiceQueue;

const registerV2ServiceQueue = async (token, userId, follows, topics, locations, myAnonUserId) => {
  const locationsChannel = convertingUserFormatForLocation(locations);

  const data = {
    token,
    userId,
    locationsChannel,
    follows,
    topics,
    anonUserId: myAnonUserId,
    locations
  };

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true
  };

  try {
    await registerV2Queue.add(data, options);
  } catch (e) {
    console.log('error', e);
  }
};

module.exports = {
  registerServiceQueue,
  registerV2ServiceQueue
};
