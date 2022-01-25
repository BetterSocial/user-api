const Bull = require("bull");
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");

const { convertString } = require("../../utils/custom");

// const connectRedis = String(process.env.REDIS_UR)L;

const postTimeQueue = new Bull("addQueuePostTime", {
  redis: String(process.env.REDIS_URL),
});
postTimeQueue.on('error', (err) => console.log('posttimeque', err));

const followLocationQueue = new Bull("followLocationQueue", {
  redis: String(process.env.REDIS_URL),
});
followLocationQueue.on('error', (err) => console.log('followLocationQueue', err));

const followUserQueue = new Bull("followUserQueue", {
  redis: String(process.env.REDIS_URL),
});
followUserQueue.on('error', (err) => console.log('followUserQueue', err));

const followTopicQueue = new Bull("followTopicQueue", {
  redis: String(process.env.REDIS_URL),
});
followTopicQueue.on('error', (err) => console.log('followTopicQueue', err));

const addUserToChannelQueue = async (data, options) => {
  const queue = new Bull("addUserToChannelQueue", {
    redis: String(process.env.REDIS_URL),
  });
  queue.on('error', (err) => console.log('addUserToChannelQueue', err));


  queue.add(data, options);
  return queue;
};

const addUserToTopicChannel = async (data, options) => {
  const queue = new Bull("addUserToTopicChannelQueue", {
    redis: String(process.env.REDIS_URL),
  });
  queue.on('error', (err) => console.log('addUserToTopicChannelQueue', err));

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

  const locationQueue = new Bull(
    "addUserToChannelQueue",
    {
      redis: String(process.env.REDIS_URL),
    }
  );
  locationQueue.on('error', (err) => console.log('addUserToChannelQueue', err));
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


const prepopulatedDmQueue = async (id, ids) => {
  const queue = new Bull(
    "prepopulatedDmQueue",
    {
      redis: String(process.env.REDIS_URL),
    }
  );

  queue.on('error', (err) => console.log('addUserToChannelQueue', err));

  let data = {
    id,
    ids,
  }

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
  };

  queue.add(data, options);
  return queue;
}



module.exports = {
  postTimeQueue,
  followLocationQueue,
  followUserQueue,
  followTopicQueue,
  addToChannelChatQueue,
  addUserToChannelQueue,
  addUserToTopicChannel,
  prepopulatedDmQueue,
};