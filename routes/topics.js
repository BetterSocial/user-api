const express = require('express');
const router = express.Router();

// controller
const topicsController = require('../controllers/topics');
const { isAuth, isAuthV2 } = require('../middlewares/auth');

/* GET locations listing. */
router.get('/list', topicsController.topics);
router.get('/followed', isAuth, topicsController.getFollowedTopic);
router.put("/follow", isAuth, topicsController.putFollowTopic);
router.put("/follow-v2", isAuthV2, topicsController.followTopicV2);
router.get("/", isAuth, topicsController.getTopics);

module.exports = router;