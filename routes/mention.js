const express = require('express');
const mentionUserController = require('../controllers/mention/mentionUser');
const router = express.Router();

router.get('/users', mentionUserController);

module.exports = router;