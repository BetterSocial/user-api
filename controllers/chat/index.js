const deleteChat = require('./deleteChat');
const sendSignedMessage = require('./sendSignedMessage');
const moveToAnon = require('./moveToAnon');
const setSignedChannelAsRead = require('./setSignedChannelAsRead');
const findOrCreateChannelBySignedSender = require('./findOrCreateChannelBySignedSender');

module.exports = {
  deleteChat,
  sendSignedMessage,
  moveToAnon,
  setSignedChannelAsRead,
  findOrCreateChannelBySignedSender
};
