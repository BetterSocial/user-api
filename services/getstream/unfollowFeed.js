const {unFollowFeedProcessQueue} = require('../score/queueSenderForRedis');

module.exports = async (feed, userId, targetFeed, unfollowUserId) => {
  try {
    if (!feed || !userId || !targetFeed || !unfollowUserId) {
      throw new Error('Invalid parameters');
    }
    const result = await unFollowFeedProcessQueue.add({
      feed,
      userId,
      targetFeed,
      unfollowUserId
    });
    return result;
  } catch (error) {
    return {
      error: error.message
    };
  }
};
