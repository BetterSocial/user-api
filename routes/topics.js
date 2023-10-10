const express = require('express');

const router = express.Router();

// controller
const topicsController = require('../controllers/topics');
const {isAuth, isAuthV2} = require('../middlewares/auth');
const QueryParamsValidationMiddleware = require('../middlewares/query-params-validation');

/* GET locations listing. */
router.get('/list', topicsController.topics);
router.get('/followed', isAuth, topicsController.getFollowedTopic);
router.get('/follow', isAuth, topicsController.getFollowTopic);
router.put('/follow', isAuth, topicsController.putFollowTopic);
router.put('/follow-v2', isAuthV2, topicsController.followTopicV2);
router.get('/', isAuth, topicsController.getTopics);
router.get(
  '/follower-list',
  QueryParamsValidationMiddleware.searchTopicFollower,
  isAuth,
  topicsController.getFollowerList
);

router.get('/subscribeable', isAuth, topicsController.getSubscribeableTopics);

module.exports = router;
