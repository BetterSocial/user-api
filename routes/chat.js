const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat/ChatController');

const auth = require('../middlewares/auth');

router.get('/create-channel', chatController.createChannel);
router.post('/add-moderator', chatController.addChannelModerator);
router.post('/add-members-channel', auth.isAuth, chatController.addMembers);
router.post('/anonymous', auth.isAuth, chatController.sendAnonymous);
router.get('/channels', auth.isAuthAnonim, chatController.getChannels);
router.get(
  '/channels/:channelId',
  auth.isAuthAnonim,
  chatController.getChannel
);
router.post('/init-chat', auth.isAuth, chatController.initChat);
router.post(
  '/init-chat-anonymous',
  auth.isAuthAnonim,
  chatController.initChatAnonymous
);
router.post(
  '/users/:targetUserId',
  auth.isAuth,
  chatController.getMyAnonProfile
);
router.post(
  '/channels/:channelId/read',
  auth.isAuth,
  chatController.readChannel
);

module.exports = router;
