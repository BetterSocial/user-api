const changeChannelDetail = require('./changeChannelDetail');
const deleteChat = require('./deleteChat');
const findOrCreateChannelBySignedSender = require('./findOrCreateChannelBySignedSender');
const listFeaturedGif = require('./gif/listFeaturedGif');
const moveToAnon = require('./moveToAnon');
const moveToSign = require('./moveToSign');
const searchGif = require('./gif/searchGif');
const registerShareGif = require('./gif/registerShareGif');
const sendSignedMessage = require('./sendSignedMessage');
const setSignedChannelAsRead = require('./setSignedChannelAsRead');
const deleteMessage = require('./deleteMessage');

module.exports = {
  changeChannelDetail,
  deleteChat,
  findOrCreateChannelBySignedSender,
  listFeaturedGif,
  moveToAnon,
  moveToSign,
  registerShareGif,
  searchGif,
  sendSignedMessage,
  setSignedChannelAsRead,
  deleteMessage
};
