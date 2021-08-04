var express = require('express');
var router = express.Router();

const feed = require('./feeds');
const users = require('./users');
const whoToFollow = require('./whoToFollow');
const topics = require('./topics');
const locations = require('./locations');
const auth = require('../middlewares/auth');
const chat = require('../routes/chat');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/activity', auth.isAuth, feed);
router.use('/users', users);
router.use('/topics', topics);
router.use('/location', locations);
router.use('/who-to-follow', whoToFollow);
router.use('/chat', chat);
router.post('/test', async (req, res) => {
  const { v4: uuidv4 } = require('uuid');
  const {
    followLocationQueue,
    followTopicQueue,
    followUserQueue,
  } = require('../services/redis');
  /*
                  @description options bull queue ref https://www.npmjs.com/package/bull
                */
  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
  };
  let id = [];
  const data = { id: '123', topic: 'ini follow location' };
  const resultJob = await followLocationQueue.add(data, options);
  id.push(resultJob.id);

  const optionsUser = {
    jobId: uuidv4(),
    removeOnComplete: true,
  };
  const dataUser = { id: '434', topic: 'ini follow user' };
  const resultJobUser = await followUserQueue.add(dataUser, optionsUser);
  id.push(resultJobUser.id);

  const optionsTopic = {
    jobId: uuidv4(),
    removeOnComplete: true,
  };
  const dataTopic = { id: '56', topic: 'ini follow topic' };
  const resultJobTopic = await followTopicQueue.add(dataTopic, optionsTopic);

  id.push(resultJobTopic.id);

  return res.status(200).json({
    code: 200,
    status: `success created queue post time with job id : ${id}`,
    data: data,
  });
});

module.exports = router;
