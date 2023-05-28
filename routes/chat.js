const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat/ChatController');

const auth = require('../middlewares/auth');

router.get('/create-channel', chatController.createChannel);
router.post('/add-moderator', chatController.addChannelModerator);
router.post('/add-members-channel', auth.isAuth, chatController.addMembers);
router.post('/anonymous', auth.isAuthAnonim, chatController.sendAnonymous);
router.get('/channels', auth.isAuthAnonim, chatController.getChannels);
router.get(
  '/channels/:channelId',
  auth.isAuthAnonim,
  chatController.getChannel
);

module.exports = router;
