const UploadController = require('../controllers/upload');
const { isAuth } = require('../middlewares/auth');
const BodyValidationMiddleware = require('../middlewares/body-validation');
const UploadRouter = require('express').Router();

UploadRouter.post('/photo', isAuth, BodyValidationMiddleware.uploadPhoto, UploadController.uploadPhoto)

module.exports = UploadRouter;