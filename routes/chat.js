const express = require('express');

const router = express.Router();
const chatController = require('../controllers/chat/ChatController');

const auth = require('../middlewares/auth');
const isTargetUserAllowingAnonDMMiddleware = require('../middlewares/chat/isTargetUserAllowingAnonDMMiddleware');
const SuccessMiddleware = require('../middlewares/success');

router.get('/create-channel', chatController.createChannel);
router.post('/add-moderator', chatController.addChannelModerator);
router.post('/add-members-channel', auth.isAuth, chatController.addMembers);
router.post('/anonymous', auth.isAuth, chatController.sendAnonymous);
router.get('/channels', auth.isAuthAnonim, chatController.getChannels);
// router.get('/channels/signed', auth.isAuthV2, chatController.getChannels);
router.get('/channels/signed', chatController.getChannels);
router.get('/channels/:channelId', auth.isAuthAnonim, chatController.getChannel);
router.post('/init-chat', auth.isAuth, chatController.initChat);
router.post('/init-chat-anonymous', auth.isAuthAnonim, chatController.initChatAnonymous);
router.post('/users/:targetUserId', auth.isAuth, chatController.getMyAnonProfile);
router.post('/channels/:channelId/read', auth.isAuthAnonim, chatController.readChannel);
router.post(
  '/channels',
  auth.isAuthAnonim,
  isTargetUserAllowingAnonDMMiddleware,
  chatController.findOrCreateChannel
);
router.post(
  '/channels/check-allow-anon-dm-status',
  auth.isAuthAnonim,
  isTargetUserAllowingAnonDMMiddleware,
  SuccessMiddleware
);

module.exports = router;
