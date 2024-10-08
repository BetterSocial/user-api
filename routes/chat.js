const express = require('express');

const router = express.Router();
const chatController = require('../controllers/chat/ChatController');

const auth = require('../middlewares/auth');
const isTargetUserAllowingAnonDMMiddleware = require('../middlewares/chat/isTargetUserAllowingAnonDMMiddleware');
const SuccessMiddleware = require('../middlewares/success');
const BodyValidationMiddleware = require('../middlewares/body-validation');
const getSignedChannelList = require('../controllers/chat/getSignedChannelList');
const {
  changeChannelDetail,
  findOrCreateChannelBySignedSender,
  moveToAnon,
  moveToSign,
  sendSignedMessage,
  setSignedChannelAsRead,
  searchGif,
  listFeaturedGif,
  registerShareGif,
  deleteMessage,
  initChatFromPost,
  groupAddMembers,
  removeGroupMember,
  initChatFromProfileAsAnonymousV2,
  initChatFromProfileAsSignedV2,
  sendAnonymousMessage,
  newChatAnonymous,
  leaveGroupMember,
  getMessageDetail,
  testFCMToken
} = require('../controllers/chat');
const {ChatValidation} = require('../joi-validations/chat.validations');
const {validate} = require('../middlewares/joi-validation/validate');
const getChannelDetail = require('../controllers/chat/getChannelDetail');

router.get('/create-channel', chatController.createChannel);
router.post('/add-moderator', chatController.addChannelModerator);
router.post('/add-members-channel', auth.isAuth, chatController.addMembers);
router.post('/anonymous', auth.isAuthAnonim, sendAnonymousMessage);
router.post('/send-signed-message', auth.isAuthV2, sendSignedMessage);

router.get('/channels', auth.isAuthAnonim, chatController.getChannels);
router.get(
  '/channels/signed',
  BodyValidationMiddleware.commonLimitOffset,
  auth.isAuthV2,
  getSignedChannelList
);
router.get(
  '/channel-detail',
  validate(ChatValidation.getChannelDetail),
  auth.isAuth,
  getChannelDetail
);
router.get('/channels/:channelId', auth.isAuthAnonim, chatController.getChannel);
router.post('/init-chat', auth.isAuth, chatController.initChat);
router.post('/init-chat-anonymous', auth.isAuthAnonim, chatController.initChatAnonymous);
router.post(
  '/init-chat-anonymous-v2',
  auth.isAuthAnonim,
  validate(ChatValidation.initChatFromProfileAsAnonymousV2),
  initChatFromProfileAsAnonymousV2
);
router.post(
  '/init-chat-signed-v2',
  auth.isAuthV2,
  validate(ChatValidation.initChatFromProfileAsSignedV2),
  initChatFromProfileAsSignedV2
);
router.post('/move-to-anon', auth.isAuthAnonim, validate(ChatValidation.moveToAnon), moveToAnon);
router.post('/move-to-sign', auth.isAuthV2, validate(ChatValidation.moveToSign), moveToSign);
router.post(
  '/init-chat-from-post',
  auth.isAuth,
  validate(ChatValidation.initChatFromPost),
  initChatFromPost
);
router.post('/new-chat-anonymous', auth.isAuthAnonim, newChatAnonymous);
router.post('/users/:targetUserId', auth.isAuth, chatController.getMyAnonProfile);
router.post(
  '/channels/read',
  BodyValidationMiddleware.setSignedChannelAsRead,
  auth.isAuthV2,
  setSignedChannelAsRead
);
router.post('/channels/:channelId/read', auth.isAuthAnonim, chatController.readChannel);
router.post(
  '/channels',
  auth.isAuthAnonim,
  isTargetUserAllowingAnonDMMiddleware,
  chatController.findOrCreateChannel
);

router.post(
  '/channels-signed',
  validate(ChatValidation.findOrCreateChannelBySignedSender),
  auth.isAuthV2,
  findOrCreateChannelBySignedSender
);

router.post(
  '/channels/check-allow-anon-dm-status',
  auth.isAuthAnonim,
  isTargetUserAllowingAnonDMMiddleware,
  SuccessMiddleware
);

router.post(
  '/channel-detail',
  auth.isAuthV2,
  validate(ChatValidation.changeChannelDetail),
  changeChannelDetail
);

router.post(
  '/group/add-members',
  validate(ChatValidation.addMembers),
  auth.isAuthV2,
  groupAddMembers
);

router.get('/gif/search', validate(ChatValidation.searchGif), auth.isAuth, searchGif);
router.get('/gif/featured', validate(ChatValidation.listTrendingGif), auth.isAuth, listFeaturedGif);
router.get(
  '/gif/registershare',
  validate(ChatValidation.registerShareGif),
  auth.isAuth,
  registerShareGif
);

router.delete('/message/:messageID', auth.isAuth, deleteMessage);

router.post(
  '/group/remove-member',
  validate(ChatValidation.removeGroupMember),
  auth.isAuthV2,
  removeGroupMember
);

router.post(
  '/group/leave',
  validate(ChatValidation.leaveGroupMember),
  auth.isAuthV2,
  leaveGroupMember
);

router.get('/message/:messageID', auth.isAuth, getMessageDetail);
router.post('/test-fcm-token', auth.isAuth, testFCMToken);

module.exports = router;
