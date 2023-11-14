const deleteChat = require('./deleteChat');
const sendSignedMessage = require('./sendSignedMessage');
const moveToAnon = require('./moveToAnon');
const moveToSign = require('./moveToSign');
const setSignedChannelAsRead = require('./setSignedChannelAsRead');
const findOrCreateChannelBySignedSender = require('./findOrCreateChannelBySignedSender');

module.exports = {
  deleteChat,
  sendSignedMessage,
  moveToAnon,
  moveToSign,
  setSignedChannelAsRead,
  findOrCreateChannelBySignedSender
};
