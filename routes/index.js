const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const chat = require('../routes/chat');
const discovery = require('./discovery');
const domain = require('../routes/domain');
const feed = require('./feeds');
const fileRouter = require('../routes/file');
const locations = require('./locations');
const topicPage = require('./topicPages');
const topics = require('./topics');
const users = require('./users');
const whoToFollow = require('./whoToFollow');
const configRouter = require('./config');

/* GET home page. */
router.get('/', function (req, res, next) {
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

module.exports = router;
