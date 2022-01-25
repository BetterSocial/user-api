const Bull = require("bull");
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");

const { convertString } = require("../../utils/custom");

const connectRedis = String('redis://:p2fd676e97e776358ee7eeddb92833f11ac1c88785ac43c2dd57e117339ba024e@ec2-3-216-114-120.compute-1.amazonaws.com:15309');

const postTimeQueue = new Bull("addQueuePostTime", {
  redis: connectRedis,
});
postTimeQueue.on('error', (err) => console.log('posttimeque', err));

const followLocationQueue = new Bull("followLocationQueue", {
  redis: connectRedis,
});
followLocationQueue.on('error', (err) => console.log('followLocationQueue', err));

const followUserQueue = new Bull("followUserQueue", {
  redis: connectRedis,
});
followUserQueue.on('error', (err) => console.log('followUserQueue', err));

const followTopicQueue = new Bull("followTopicQueue", {
  redis: connectRedis,
});
followTopicQueue.on('error', (err) => console.log('followTopicQueue', err));

const addUserToChannelQueue = async (data, options) => {
  const queue = new Bull("addUserToChannelQueue", {
    redis: connectRedis,
  });
  queue.on('error', (err) => console.log('addUserToChannelQueue', err));


  queue.add(data, options);
  return queue;
};

const addUserToTopicChannel = async (data, options) => {
  const queue = new Bull("addUserToTopicChannelQueue", {
    redis: connectRedis,
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
      redis: connectRedis,
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
      redis: connectRedis,
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