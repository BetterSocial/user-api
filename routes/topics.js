var express = require('express');
var router = express.Router();

// controller
const topicsController = require('../controllers/topics');

/* GET locations listing. */
router.get('/list', topicsController.topics);

module.exports = router;