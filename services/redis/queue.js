const Bull = require('bull');
const {v4: uuidv4} = require('uuid');
const momentTz = require('moment-timezone');
const {sample} = require('lodash');

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

const followTopicQueue = new Bull('followTopic', connectRedis, {
  redis: {
    ...bullConfig,
    maxRetriesPerRequest: 100,
    connectTimeout: 30000
  }
});

followTopicQueue.on('error', (err) => {
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

const setRequiredTime = (delay) => {
  let requiredTime = momentTz().tz('America/Los_Angeles');
  if (delay === 0) {
    const randomTime = Math.floor(Math.random() * (40 - 10 + 1)) + 10;
    requiredTime = momentTz().tz('America/Los_Angeles').add(randomTime, 'minutes');
  } else {
    const randomTime = sample([6, 7, 8]);
    const additionalDays = delay;
    requiredTime = momentTz()
      .tz('America/Los_Angeles')
      .set({hour: randomTime})
      .add(additionalDays, 'days');
  }
  return requiredTime;
};

const followTopicServiceQueue = async (user_id, topic_id, community_message_format_id, delay) => {
  const data = {
    user_id,
    topic_id,
    community_message_format_id
  };
  let currentTime = momentTz().tz('America/Los_Angeles');
  let requiredTime = setRequiredTime(delay);
  const diffTime = requiredTime.diff(currentTime, 'milliseconds');

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
    delay: diffTime
  };
  try {
    await followTopicQueue.add(data, options);
  } catch (e) {
    console.log('error', e);
  }
};

module.exports = {
  registerServiceQueue,
  followTopicQueue,
  registerV2ServiceQueue,
  followTopicServiceQueue
};
