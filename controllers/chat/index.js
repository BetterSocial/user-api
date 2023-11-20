const changeChannelDetail = require('./changeChannelDetail');
const deleteChat = require('./deleteChat');
const findOrCreateChannelBySignedSender = require('./findOrCreateChannelBySignedSender');
const moveToAnon = require('./moveToAnon');
const moveToSign = require('./moveToSign');
const sendSignedMessage = require('./sendSignedMessage');
const setSignedChannelAsRead = require('./setSignedChannelAsRead');

module.exports = {
  changeChannelDetail,
  deleteChat,
  findOrCreateChannelBySignedSender,
  moveToAnon,
  moveToSign,
  sendSignedMessage,
  setSignedChannelAsRead
};
