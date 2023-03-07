const { StreamChat } = require("stream-chat");

const createTokenChat = async (userId) => {
    const serverClient = new StreamChat(process.env.API_KEY, process.env.SECRET);
    return serverClient.createToken(userId);
};

module.exports = createTokenChat