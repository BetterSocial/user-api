const StreamChat = require('stream-chat').StreamChat;
StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);

module.exports = StreamChat();
