const express = require('express');
const router = express.Router();
const LinkController = require('../controllers/links');

router.get('/:postId', LinkController.PostLink);

module.exports = router;
