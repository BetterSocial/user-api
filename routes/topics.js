const express = require('express');

const router = express.Router();

// controller
const topicsController = require('../controllers/topics');
const {isAuth} = require('../middlewares/auth');
const {validate} = require('../middlewares/joi-validation/validate');
const {TopicValidation} = require('../joi-validations/topics.validations');
const QueryParamsValidationMiddleware = require('../middlewares/query-params-validation');

/* GET locations listing. */
router.get('/list', topicsController.topics);
router.get('/followed', isAuth, topicsController.getFollowedTopic);
router.get('/follow', isAuth, topicsController.getFollowTopic);
router.get('/latest', validate(TopicValidation.latestPost), isAuth, topicsController.getLatestPost);
router.put('/follow', isAuth, topicsController.putFollowTopic);
router.put('/follow-v2', isAuth, topicsController.followTopicV2);
router.get('/is-exist', validate(TopicValidation.checkName), isAuth, topicsController.checkName);
router.post('/create', validate(TopicValidation.create), isAuth, topicsController.create);
router.get('/', isAuth, topicsController.getTopics);
router.get(
  '/follower-list',
  QueryParamsValidationMiddleware.searchTopicFollower,
  isAuth,
  topicsController.getFollowerList
);

router.get('/subscribable', isAuth, topicsController.getSubscribableTopic);

module.exports = router;
