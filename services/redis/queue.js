const Bull = require("bull");
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");

const { convertString } = require("../../utils/custom");

const postTimeQueue = new Bull("addQueuePostTime", {
  redis: {
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls: {
      rejectUnauthorized: false,
      servername: process.env.REDIS_HOST
    }
  },
});

const followLocationQueue = new Bull("followLocationQueue", {
  redis: {
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls: {
      rejectUnauthorized: false,
      servername: process.env.REDIS_HOST
    }
  },
});

const followUserQueue = new Bull("followUserQueue", {
  redis: {
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls: {
      rejectUnauthorized: false,
      servername: process.env.REDIS_HOST
    }
  },
});

const followTopicQueue = new Bull("followTopicQueue", {
  redis: {
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls: {
      rejectUnauthorized: false,
      servername: process.env.REDIS_HOST
    }
  },
});

const addUserToChannelQueue = async (data, options) => {
  const queue = new Bull("addUserToChannelQueue",
    {
      redis: {
        password: process.env.REDIS_PASSWORD,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        tls: {
          rejectUnauthorized: false,
          servername: process.env.REDIS_HOST
        }
      },
    });

  queue.add(data, options);
  return queue;
};

const addUserToTopicChannel = async (data, options) => {
  const queue = new Bull("addUserToTopicChannelQueue", {
    redis: {
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      tls: {
        rejectUnauthorized: false,
        servername: process.env.REDIS_HOST
      }
    },
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

  const locationQueue = new Bull(
    "addUserToChannelQueue",
    {
      redis: {
        password: process.env.REDIS_PASSWORD,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        tls: {
          rejectUnauthorized: false,
          servername: process.env.REDIS_HOST
        }
      },
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
