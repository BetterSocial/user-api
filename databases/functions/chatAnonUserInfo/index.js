const createChatAnonUserInfo = require('./create-chat-anon-user-info');
const findAnonUserInfo = require('./find-anon-user-info');
const findExistingChannelForAnonUser = require('./find-existing-channel-for-anon-user');

const ChatAnonUserInfoFunction = {
  createChatAnonUserInfo,
  findAnonUserInfo,
  findExistingChannelForAnonUser
};

module.exports = ChatAnonUserInfoFunction;
