var express = require('express');
var router = express.Router();

const { isAuth } = require('../middlewares/auth');
var fileController = require('../controllers/file')

router.post('/upload', isAuth, fileController.upload)

module.exports = router;