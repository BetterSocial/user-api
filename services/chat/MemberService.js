const {
  addUserToChannelQueue,
  addUserToTopicChannel,
} = require("../../services/redis");
const { v4: uuidv4 } = require("uuid");
const { convertString } = require("../../utils/custom");
const _ = require("lodash");

const addUserToTopic = async (topics, userId) => {
  console.log("***********************************************************");
  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
  };

  let newDataTopic = topics.map((item) => {
    return convertString(item.toLowerCase(), " ", "-");
  });

  let data = {
    user_id: userId,
    channelIds: newDataTopic,
  };
  console.log(data);
  console.log("addUserToTopic");
  const resultJob = await addUserToTopicChannel(data, options);
  return resultJob;
};

const addUserToLocation = async (locations, userId) => {
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
    channelIds: temp,
  };
  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
  };

  const resultJob = await addUserToChannelQueue(data, options);
  return resultJob;
};

module.exports = {
  addUserToTopic,
  addUserToLocation,
};
