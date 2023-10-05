const {removeActivityQueue} = require('../score/queueSenderForRedis');

const DELAY_TIME = 60000 * 10; // in miliseconds
module.exports = async (feed, userId, activiyId) => {
  try {
    if (!feed || !userId || !activiyId) {
      throw new Error('Invalid parameters');
    }
    return await removeActivityQueue.add(
      {
        feed_group: feed,
        feed_id: userId,
        activity_id: activiyId
      },
      {delay: DELAY_TIME}
    );
  } catch (error) {
    console.error(error);
  }
};
