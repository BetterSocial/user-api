var express = require('express');
var router = express.Router();

// controller
const whoToFollowController = require('../controllers/whoToFollow');

/* GET user listing. */
router.get('/list', whoToFollowController.whoToFollow);

module.exports = router;
