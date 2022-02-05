const Bull = require("bull");
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");
const url = require('url');

const { convertString } = require("../../utils/custom");
const REDIS_URL = process.env.REDIS_URL;
const redis_uri = url.parse(REDIS_URL);

const connectRedis = process.env.REDIS_URL;

const postTimeQueue = new Bull("addQueuePostTime", connectRedis,
  {
    redis: {
      tls: {
        rejectUnauthorized: false,
      },
      connectTimeout: 3000
    },
  }
);
postTimeQueue.on('error', (err) => console.log('posttimeque', err));
postTimeQueue.on('waiting', (e) => console.log('postime: ', e));

const followLocationQueue = new Bull("followLocationQueue", connectRedis,
  {
    redis: {
      tls: {
        rejectUnauthorized: false,
      },
      connectTimeout: 3000
    }
  }
);
followLocationQueue.on('error', (err) => console.log('followLocationQueue', err));


const prepopulatedDmQueue = new Bull("prepopulatedDmQueue", connectRedis,
  {
    redis: {
      tls: {
        rejectUnauthorized: false,
      },
      connectTimeout: 3000
    }
  }
);
prepopulatedDmQueue.on('error', (err) => console.log('prepopulatedDmQueue', err));

const followUserQueue = new Bull("followUserQueue", connectRedis,
  {
    redis: {
      tls: {
        rejectUnauthorized: false,
      },
      connectTimeout: 3000
    }
  }
);
followUserQueue.on('error', (err) => console.log('followUserQueue', err));

const followTopicQueue = new Bull("followTopicQueue", connectRedis,
  {
    redis: {
      tls: {
        rejectUnauthorized: false,
      },
      connectTimeout: 3000
    }
  }
);
followTopicQueue.on('error', (err) => console.log('followTopicQueue', err));


const addUserToChannel = new Bull("addUserToChannelQueue",
  connectRedis,
  {
    redis: {
      tls: {
        rejectUnauthorized: false,
      },
      connectTimeout: 3000
    }
  }
);
addUserToChannel.on('error', (err) => console.log('addUserToChannelQueue', err));

const addUserToChannelQueue = async (data, options) => {
  addUserToChannel.add(data, options);
  return addUserToChannel;
};

const addUserToTopicChannelQueue = new Bull("addUserToTopicChannelQueue", connectRedis,
  {
    redis: {
      tls: {
        rejectUnauthorized: false,
      },
      connectTimeout: 3000
    }
  }
);
addUserToTopicChannelQueue.on('error', (err) => console.log('addUserToTopicChannelQueue', err));

const addUserToTopicChannel = async (data, options) => {
  addUserToTopicChannelQueue.add(data, options);
  return addUserToTopicChannelQueue;
};


const locationQueue = new Bull(
  "addUserToChannelQueue",
  connectRedis,
  {
    redis: {
      tls: {
        rejectUnauthorized: false,
      },
      connectTimeout: 3000
    }
  }
);
locationQueue.on('error', (err) => console.log('addUserToChannelQueue', err));

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
  prepopulatedDmQueue,
  prepopulatedDmQueue,
};