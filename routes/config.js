const express = require('express');
const router = express.Router();
const configController = require('../controllers/config');

router.get('/is-demo-login-enabled', configController.isDemoLoginViewEnabled);

module.exports = router;
