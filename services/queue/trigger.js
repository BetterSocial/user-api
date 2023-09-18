const QueueInstance = require('./queueInit');
const {v4: uuid} = require('uuid');
const Bull = require('bull');

/**
 *
 * @param {AddCommentToDbQueuePayload} data
 * @returns
 */
const addCommentToDb = (data) => {
  /**
   * @type {Bull.JobOptions}
   */
  const options = {
    jobId: uuid(),
    removeOnComplete: true
  };

  QueueInstance.addCommentToDbQueue.add(data, options);
};

/**
 *
 * @param {DeleteCommentByBlockPayload} data
 * @returns
 */
const deleteCommentByBlock = (data) => {
  /**
   * @type {Bull.JobOptions}
   */
  const options = {
    jobId: uuid(),
    removeOnComplete: true
  };

  QueueInstance.deleteCommentByBlockTriggerQueue.add(data, options);
};

const QueueTrigger = {
  addCommentToDb,
  deleteCommentByBlock
};

module.exports = QueueTrigger;
