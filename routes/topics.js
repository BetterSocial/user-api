const express = require('express');
const router = express.Router();

// controller
const topicsController = require('../controllers/topics');
const { isAuth } = require('../middlewares/auth');

/* GET locations listing. */
router.get('/list', topicsController.topics);
router.get('/followed', isAuth, topicsController.getFollowedTopic);
router.get("/follow", isAuth, topicsController.getFollowTopic)
router.put("/follow", isAuth, topicsController.putFollowTopic)
router.get("/", isAuth, topicsController.getTopics);

module.exports = router;