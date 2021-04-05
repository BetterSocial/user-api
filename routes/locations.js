var express = require('express');
var router = express.Router();

// controller
const locationsController = require('../controllers/locations');

/* GET locations listing. */
router.post('/list', locationsController.locations);

module.exports = router;