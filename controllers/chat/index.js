const changeChannelDetail = require('./group/changeChannelDetail');
const deleteChat = require('./deleteChat');
const findOrCreateChannelBySignedSender = require('./findOrCreateChannelBySignedSender');
const groupAddMembers = require('./group/groupAddMembers');
const initChatFromProfileAsAnonymousV2 = require('./initChatFromProfileAsAnonymousV2');
const initChatFromProfileAsSignedV2 = require('./initChatFromProfileAsSignedV2');
const listFeaturedGif = require('./gif/listFeaturedGif');
const moveToAnon = require('./moveToAnon');
const moveToSign = require('./moveToSign');
const initChatFromPost = require('./initChatFromPost');
const searchGif = require('./gif/searchGif');
const registerShareGif = require('./gif/registerShareGif');
const removeGroupMember = require('./group/removeGroupMember');
const sendSignedMessage = require('./sendSignedMessage');
const sendAnonymousMessage = require('./sendAnonymousMessage');
const setSignedChannelAsRead = require('./setSignedChannelAsRead');
const deleteMessage = require('./deleteMessage');
const newChatAnonymous = require('./newChatAnonymous');
const leaveGroupMember = require('./group/leaveGroupMember');
const getMessageDetail = require('./getMessageDetail');

module.exports = {
  changeChannelDetail,
  deleteChat,
  findOrCreateChannelBySignedSender,
  groupAddMembers,
  initChatFromProfileAsAnonymousV2,
  initChatFromProfileAsSignedV2,
  listFeaturedGif,
  moveToAnon,
  moveToSign,
  initChatFromPost,
  registerShareGif,
  removeGroupMember,
  searchGif,
  sendAnonymousMessage,
  sendSignedMessage,
  setSignedChannelAsRead,
  deleteMessage,
  newChatAnonymous,
  leaveGroupMember,
  getMessageDetail
};
