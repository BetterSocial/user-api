const express = require('express');
const auth = require('../middlewares/auth');
const chat = require('./chat');
const discovery = require('./discovery');
const domain = require('./domain');
const feed = require('./feeds');
const fileRouter = require('./file');
const locations = require('./locations');
const topics = require('./topics');
const users = require('./users');
const whoToFollow = require('./whoToFollow');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', {title: 'Hello'});
});

router.use('/activity', auth.isAuth, feed);
router.use('/discovery', discovery);
router.use('/users', users);
router.use('/topics', topics);
router.use('/location', locations);
router.use('/who-to-follow', whoToFollow);
router.use('/chat', chat);
router.use('/domain', domain);
router.use('/file', fileRouter);
router.get('just-testing', (req, res) => {
  res.send('Hello World!');
});

module.exports = router;
