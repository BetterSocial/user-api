var express = require('express');
var router = express.Router();

// controller
const topicsController = require('../controllers/topics');
const { isAuth } = require('../middlewares/auth');

/* GET locations listing. */
router.get('/list', topicsController.topics);
router.get("/follow", isAuth, topicsController.getFollowTopic)
router.put("/follow", isAuth, topicsController.putFollowTopic)

module.exports = router;