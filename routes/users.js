const express = require('express');
const expressLimiter = require('express-limiter');

const router = express.Router();
const usersHandler = require('../controllers/users');
const auth = require('../middlewares/auth');
const BodyValidationMiddleware = require('../middlewares/body-validation');
const RegisterV2UploadPhotoMiddleware = require('../middlewares/upload-photo/registerV2');
const VerifyUserV2Middleware = require('../middlewares/verify-user');
const {redisClient} = require('../config/redis');
const RegisterV2WithoutUploadPhotoMiddleware = require('../middlewares/register-user/registerV2WithoutUploadPhoto');

const rateLimiter = expressLimiter(router, redisClient);

const verifyUserRateLimiter = rateLimiter({
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

router.post('/check-username', usersHandler.checkUsername);
router.post('/register', usersHandler.register);
router.post('/demo-verify-user', usersHandler.demoVerifyUser);
router.post(
  '/demo-verify-user-v2',
  verifyUserRateLimiter,
  BodyValidationMiddleware.verifyUser,
  VerifyUserV2Middleware,
  usersHandler.demoVerifyUser
);
router.post(
  '/password-verify-user',
  verifyUserRateLimiter,
  BodyValidationMiddleware.checkPasswordForDemoLogin,
  usersHandler.checkPasswordForDemoLogin
);
router.post('/verify-user', usersHandler.verifyUser);
router.get('/veryfy-token', usersHandler.veryfyToken);
router.get('/refresh-token', auth.isRefreshToken, usersHandler.refreshToken);
router.get('/veryfy-token-getstream', auth.isAuth, usersHandler.varifyTokenGetstream);
router.get('/showing-audience-estimates', auth.isAuth, usersHandler.showingAudience);
router.post('/blockuser', auth.isAuth, usersHandler.blockUser);
router.post('/block-domain', auth.isAuth, usersHandler.blockDomain);
router.post('/check-block-status', auth.isAuth, usersHandler.userBlockStatus);
router.post('/unblock', auth.isAuth, usersHandler.userUnblock);
router.get('/populate', auth.isAuth, usersHandler.populate);
router.post('/block-post-anonymous', auth.isAuth, usersHandler.blockPostAnonymous);
router.post('/delete', auth.isAuth, usersHandler.deleteUser);
router.post('/rename/:userId', auth.isAuth, usersHandler.renameUser);
router.get('/chat/search', auth.isAuth, usersHandler.chatSearch);
router.post('/fcmtoken', auth.isAuth, usersHandler.fcmToken);
router.delete('/fcmtoken', auth.isAuth, usersHandler.removeFcmTokem);
router.delete('/fcmtoken-v2', auth.isAuth, usersHandler.removeSingleFcmToken);

router.post(
  '/register-v2',
  BodyValidationMiddleware.registerV2,
  RegisterV2UploadPhotoMiddleware,
  usersHandler.registerV2
);

router.post(
  '/register-v2-without-upload-photo',
  BodyValidationMiddleware.registerV2,
  RegisterV2WithoutUploadPhotoMiddleware,
  usersHandler.registerV2
);
router.post(
  '/blockuser-v2',
  auth.isAuth,
  BodyValidationMiddleware.blockUserV2,
  usersHandler.blockUserV2
);
router.post(
  '/unblockuser-v2',
  auth.isAuth,
  BodyValidationMiddleware.unblockUserV2,
  usersHandler.unblockUserV2
);
router.get('/check-follow', auth.isAuth, usersHandler.checkFollow);
router.post(
  '/check-follow-batch',
  auth.isAuth,
  BodyValidationMiddleware.checkUserFollowStatus,
  usersHandler.checkFollowBatch
);
router.post(
  '/check-exchange-token',
  BodyValidationMiddleware.checkHumanIdExchangeToken,
  usersHandler.checkHumanIdExchangeTokenController
);

router.post(
  '/block-anon-user-from-chat',
  auth.isAuth,
  BodyValidationMiddleware.blockUserV2,
  usersHandler.blockAnonUserFromChat
);

module.exports = router;
