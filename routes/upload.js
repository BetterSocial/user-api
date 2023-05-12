const Multer = require('multer')
const UploadRouter = require('express').Router();

const UploadController = require('../controllers/upload');
const { isAuth } = require('../middlewares/auth');
const BodyValidationMiddleware = require('../middlewares/body-validation');

const upload = Multer({ dest: 'public/uploads/' })

UploadRouter.post('/photo', isAuth, upload.single('photo'), UploadController.uploadPhoto);
UploadRouter.post('/photo-base64', isAuth, BodyValidationMiddleware.uploadPhoto, UploadController.uploadPhotoBase64)
module.exports = UploadRouter;