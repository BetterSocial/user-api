const Bull = require('bull');
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');

const { convertString } = require('../../utils/custom');

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

const addToChannelChatQueue = async (locations, token) => {
  let loc = locations.map((item) => {
    if (item.country === 'US') {
      let loc = [];
      loc.push(convertString(item.neighborhood.toLowerCase(), ' ', '-'));
      loc.push(convertString(item.city.toLowerCase(), ' ', '-'));
      return loc;
    } else {
      let loc = [];
      loc.push(convertString(item.country.toLowerCase(), ' ', '-'));
      return loc;
    }
  });
  let temp = _.union(...loc);

  const locationQueue = new Bull('addMemberToChannelQueue', {
    redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
  });
  let data = {
    token: token,
    data: temp,
  };
  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
  };
  locationQueue.add(data, options);
  return locations;
};

module.exports = {
  postTimeQueue,
  followLocationQueue,
  followUserQueue,
  followTopicQueue,
  addToChannelChatQueue,
};
