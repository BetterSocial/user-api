const changeChannelDetail = require('./group/changeChannelDetail');
const deleteChat = require('./deleteChat');
const findOrCreateChannelBySignedSender = require('./findOrCreateChannelBySignedSender');
const groupAddMembers = require('./group/groupAddMembers');
const listFeaturedGif = require('./gif/listFeaturedGif');
const moveToAnon = require('./moveToAnon');
const moveToSign = require('./moveToSign');
const searchGif = require('./gif/searchGif');
const registerShareGif = require('./gif/registerShareGif');
const removeGroupMember = require('./group/removeGroupMember');
const sendSignedMessage = require('./sendSignedMessage');
const setSignedChannelAsRead = require('./setSignedChannelAsRead');
const deleteMessage = require('./deleteMessage');

module.exports = {
  changeChannelDetail,
  deleteChat,
  findOrCreateChannelBySignedSender,
  groupAddMembers,
  listFeaturedGif,
  moveToAnon,
  moveToSign,
  registerShareGif,
  removeGroupMember,
  searchGif,
  sendSignedMessage,
  setSignedChannelAsRead,
  deleteMessage
};
