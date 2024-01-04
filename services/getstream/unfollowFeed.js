const {unFollowFeedProcessQueue} = require('../score/queueSenderForRedis');

module.exports = async (feedName, userId, targetFeed, unfollowUserId) => {
  try {
    if (!feedName || !userId || !targetFeed || !unfollowUserId) {
      throw new Error('Invalid parameters');
    }
    const result = await unFollowFeedProcessQueue.add({
      feedName,
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
