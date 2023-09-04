const express = require('express');

const router = express.Router();

const {isAuth} = require('../middlewares/auth');
const fileController = require('../controllers/file');

router.post('/upload', isAuth, fileController.upload);
router.get('/get-activities', fileController.getActivities);

module.exports = router;
