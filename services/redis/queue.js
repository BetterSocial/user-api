const Bull = require("bull");
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");

const { convertString } = require("../../utils/custom");

const connectRedis = process.env.REDIS_URL;

const postTimeQueue = new Bull("addQueuePostTime", connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  });
postTimeQueue.on('error', (err) => console.log('posttimeque', err));

const followLocationQueue = new Bull("followLocationQueue", connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  });
followLocationQueue.on('error', (err) => console.log('followLocationQueue', err));

const followUserQueue = new Bull("followUserQueue", connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  });
followUserQueue.on('error', (err) => console.log('followUserQueue', err));

const followTopicQueue = new Bull("followTopicQueue", connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  });
followTopicQueue.on('error', (err) => console.log('followTopicQueue', err));

const addUserToChannelQueue = async (data, options) => {
  const queue = new Bull("addUserToChannelQueue",
    connectRedis,
    {
      redis: { tls: { rejectUnauthorized: false } }
    });
  queue.on('error', (err) => console.log('addUserToChannelQueue', err));


  queue.add(data, options);
  return queue;
};

const addUserToTopicChannel = async (data, options) => {
  const queue = new Bull("addUserToTopicChannelQueue", connectRedis,
    {
      redis: { tls: { rejectUnauthorized: false } }
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
    connectRedis,
    {
      redis: { tls: { rejectUnauthorized: false } }
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
    connectRedis,
    {
      redis: { tls: { rejectUnauthorized: false } }
    }
  );

  queue.on('error', (err) => console.log('Pre populated dm', err));

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