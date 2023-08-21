const Multer = require('multer');
const UploadRouter = require('express').Router();

const expressLimiter = require('express-limiter');
const UploadController = require('../controllers/upload');
const {isAuth} = require('../middlewares/auth');
const BodyValidationMiddleware = require('../middlewares/body-validation');
const {redisClient} = require('../config/redis');

const rateLimiter = expressLimiter(UploadRouter, redisClient);
const uploadWithoutAuthPhotoRateLimiter = rateLimiter({
  lookup: 'connection.remoteAddress',
  method: '*',
  total: 10,
  expire: 1000 * 60 * 60,
  onRateLimited: (req, res) =>
    res.status(429).json({
      code: 429,
      message: 'Too many requests, please try again later.'
    })
});

const upload = Multer({dest: 'public/uploads/', limits: {fileSize: 10 * 1024 * 1024}});

UploadRouter.post('/photo', isAuth, upload.single('photo'), UploadController.uploadPhoto);

UploadRouter.post(
  '/photo-without-auth',
  uploadWithoutAuthPhotoRateLimiter,
  upload.single('photo'),
  UploadController.uploadPhoto
);

UploadRouter.post(
  '/photo-base64',
  isAuth,
  BodyValidationMiddleware.uploadPhoto,
  UploadController.uploadPhotoBase64
);
module.exports = UploadRouter;
