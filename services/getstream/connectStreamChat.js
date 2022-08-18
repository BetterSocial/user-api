const StreamChat = require('stream-chat').StreamChat;

const connectStreamChat = (userId, token) => {
    const client = StreamChat.getInstance(process.env.API_KEY,process.env.APP_ID);
    client.connectUser({
        id: userId
    },token)  
    return client
}
module.exports = {
    connectStreamChat
}