const changeChannelDetail = require('./group/changeChannelDetail');
const deleteChat = require('./deleteChat');
const findOrCreateChannelBySignedSender = require('./findOrCreateChannelBySignedSender');
const groupAddMembers = require('./group/groupAddMembers');
const initChatFromProfileAsAnonymousV2 = require('./initChatFromProfileAsAnonymousV2');
const listFeaturedGif = require('./gif/listFeaturedGif');
const moveToAnon = require('./moveToAnon');
const moveToSign = require('./moveToSign');
const searchGif = require('./gif/searchGif');
const registerShareGif = require('./gif/registerShareGif');
const removeGroupMember = require('./group/removeGroupMember');
const sendSignedMessage = require('./sendSignedMessage');
const setSignedChannelAsRead = require('./setSignedChannelAsRead');

module.exports = {
  changeChannelDetail,
  deleteChat,
  findOrCreateChannelBySignedSender,
  groupAddMembers,
  initChatFromProfileAsAnonymousV2,
  listFeaturedGif,
  moveToAnon,
  moveToSign,
  registerShareGif,
  removeGroupMember,
  searchGif,
  sendSignedMessage,
  setSignedChannelAsRead
};
