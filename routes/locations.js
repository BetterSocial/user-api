var express = require('express');
var router = express.Router();

// controller
const locationsController = require('../controllers/locations');

/* GET locations listing. */
router.get('/list', locationsController.list);

module.exports = router;
