const Bull = require("bull");
const { v4: uuidv4 } = require("uuid");
const connectRedis = process.env.REDIS_URL;

// init the scoring process queue object, to be used on sending message to the queue
const scoringProcessQueue = new Bull(
  "scoringProcessQueue",
  connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  });
scoringProcessQueue.on('error', (err) => console.log('scoringProcessQueue', err));

const sendQueue = async (event, data) => {
  console.log("queueSenderForRedis.sendQueue called with event[" + event + "] and data [" + JSON.stringify(data) + "]");

  let queueData = {
    event: event,
    data: data
  };

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
  };

  scoringProcessQueue.add(queueData, options);
  return;
};

module.exports = {
  sendQueue
};
