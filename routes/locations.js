const express = require('express');
const router = express.Router();

// controller
const locationsController = require('../controllers/locations');

/* GET locations listing. */
router.post('/list', locationsController.locations);
router.post('/list_v2', locationsController.locationsv2);

module.exports = router;
