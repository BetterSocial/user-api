const { addPostTimeJob, updatePostTimeJob } = require('../process/post-time-process');
const { handlerFailure, handlerCompleted, handlerStalled } = require('./handler');

const { addQueuePostTime, updateQueuePostTime  } = require('../services/redis')

const initPostTimeQueue = () => {
  console.info('addQueuePostTime job is working!');
  addQueuePostTime.process(addPostTimeJob);
  addQueuePostTime.on('failed', handlerFailure);
  addQueuePostTime.on('completed', handlerCompleted);
  addQueuePostTime.on('stalled', handlerStalled);

  console.info('updateQueuePostTime job is working!');
  updateQueuePostTime.process(updatePostTimeJob);
  updateQueuePostTime.on('failed', handlerFailure);
  updateQueuePostTime.on('completed', handlerCompleted);
  updateQueuePostTime.on('stalled', handlerStalled);
}

initPostTimeQueue();
