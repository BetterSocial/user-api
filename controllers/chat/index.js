const changeChannelDetail = require('./changeChannelDetail');
const deleteChat = require('./deleteChat');
const findOrCreateChannelBySignedSender = require('./findOrCreateChannelBySignedSender');
const listFeaturedGif = require('./gif/listFeaturedGif');
const moveToAnon = require('./moveToAnon');
const moveToSign = require('./moveToSign');
const initChatFromPost = require('./initChatFromPost');
const searchGif = require('./gif/searchGif');
const registerShareGif = require('./gif/registerShareGif');
const sendSignedMessage = require('./sendSignedMessage');
const setSignedChannelAsRead = require('./setSignedChannelAsRead');

module.exports = {
  changeChannelDetail,
  deleteChat,
  findOrCreateChannelBySignedSender,
  listFeaturedGif,
  moveToAnon,
  moveToSign,
  initChatFromPost,
  registerShareGif,
  searchGif,
  sendSignedMessage,
  setSignedChannelAsRead
};
