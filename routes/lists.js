var express = require('express');
var router = express.Router();

// controller
const listController = require('../controllers/lists');

/* GET locations listing. */
router.get('/locations', listController.location);

module.exports = router;
