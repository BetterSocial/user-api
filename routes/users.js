var express = require('express');
var router = express.Router();
const usersHandler = require('../controllers/users');
const auth = require('../middlewares/auth');
const BodyValidationMiddleware = require('../middlewares/body-validation');
const RegisterV2UploadPhotoMiddleware = require('../middlewares/upload-photo/registerV2');

router.post('/check-username', usersHandler.checkUsername);
router.post('/register', usersHandler.register);
router.post('/register-v2', BodyValidationMiddleware.registerV2, RegisterV2UploadPhotoMiddleware, usersHandler.registerV2);
router.post('/demo-verify-user', usersHandler.demoVerifyUser);
router.post('/verify-user', usersHandler.verifyUser);
router.get('/veryfy-token', usersHandler.veryfyToken);
router.get('/refresh-token', auth.isRefreshToken, usersHandler.refreshToken);
router.get(
    '/veryfy-token-getstream',
    auth.isAuth,
    usersHandler.varifyTokenGetstream
);
router.get(
    '/showing-audience-estimates',
    auth.isAuth,
    usersHandler.showingAudience
);
router.post('/blockuser', auth.isAuth, usersHandler.blockUser);
router.post('/block-domain', auth.isAuth, usersHandler.blockDomain);
router.post('/check-block-status', auth.isAuth, usersHandler.userBlockStatus);
router.post('/unblock', auth.isAuth, usersHandler.userUnblock);
router.get('/populate', auth.isAuth, usersHandler.populate);
router.post('/block-post-anonymous', auth.isAuth, usersHandler.blockPostAnonymous);
router.post('/delete', auth.isAuth, usersHandler.deleteUser);
router.post('/rename/:userId', auth.isAuth, usersHandler.renameUser);
router.get('/chat/search', auth.isAuth, usersHandler.chatSearch)
router.post('/fcmtoken', auth.isAuth, usersHandler.fcmToken)

module.exports = router;
