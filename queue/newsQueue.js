const Queue = require('bull');
const { newsJob } = require('../job');
const { handlerFailure, handlerCompleted, handlerStalled } = require('../queue/handler');

const newsQueue = new Queue('newsQueue', process.env.REDIS_URL);

newsQueue.process(newsJob);
newsQueue.on('failed', handlerFailure);
newsQueue.on('completed', handlerCompleted);
newsQueue.on('stalled', handlerStalled);

module.exports = {
  newsQueue
}
