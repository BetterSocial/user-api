const express = require('express');
const router = express.Router();

const { isAuth } = require('../middlewares/auth');
const fileController = require('../controllers/file')

router.post('/upload', isAuth, fileController.upload)

module.exports = router;