const {EVENT_FOLLOW_F2_USER, EVENT_UNFOLLOW_F2_USER} = require('../score/constant');
const {followMainFeedF2, unFollowMainFeedF2} = require('./queueInit');
const {v4: uuidv4} = require('uuid');

const sendFollowMainFeedF2 = async (userId, targetUserId) => {
  let queueData = {
    event: EVENT_FOLLOW_F2_USER,
    data: {
      userId,
      targetUserId
    }
  };

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true
  };

  const res = await followMainFeedF2.add(queueData, options);
  return res;
};

const sendUnFollowMainFeedF2 = async (userId, targetUserId) => {
  let queueData = {
    event: EVENT_UNFOLLOW_F2_USER,
    data: {
      userId,
      targetUserId
    }
  };

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true
  };
  return unFollowMainFeedF2.add(queueData, options);
};

module.exports = {
  sendFollowMainFeedF2,
  sendUnFollowMainFeedF2
};
