const express = require('express');
const mentionUserController = require('../controllers/mention/mentionUser');
const router = express.Router();

router.get('/users/:name', mentionUserController);

module.exports = router;