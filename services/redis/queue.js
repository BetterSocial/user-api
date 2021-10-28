const Bull = require("bull");
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");

const { convertString } = require("../../utils/custom");

const postTimeQueue = new Bull("addQueuePostTime", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const followLocationQueue = new Bull("followLocationQueue", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const followUserQueue = new Bull("followUserQueue", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const followTopicQueue = new Bull("followTopicQueue", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const addUserToChannelQueue = async (data, options) => {
  console.log("addUserToChannelQueue");
  const queue = new Bull("addUserToChannelQueue", {
    redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
  });

  queue.add(data, options);
  return queue;
};

const addUserToTopicChannel = async (data, options) => {
  const queue = new Bull("addUserToTopicChannelQueue", {
    redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
  });

  queue.add(data, options);
  return queue;
};

const addToChannelChatQueue = async (locations, userId) => {
  let loc = locations.map((item) => {
    if (item.country === "US") {
      let loc = [];
      loc.push(convertString(item.neighborhood.toLowerCase(), " ", "-"));
      loc.push(convertString(item.city.toLowerCase(), " ", "-"));
      return loc;
    } else {
      let loc = [];
      loc.push(convertString(item.country.toLowerCase(), " ", "-"));
      return loc;
    }
  });
  let temp = _.union(...loc);

  const locationQueue = new Bull("addUserToChannelQueue", {
    redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
  });
  let data = {
    user_id: userId,
    locations: temp,
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
  addUserToChannelQueue,
  addUserToTopicChannel,
};
