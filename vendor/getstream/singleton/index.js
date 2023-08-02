const Stream = require('getstream');
const {StreamChat} = require('stream-chat');

const GetstreamSingleton = (() => {
  let instance;
  let clientInstance;
  let chatInstance;

  const apiKey = process.env.API_KEY;
  const secret = process.env.SECRET;
  const appId = process.env.APP_ID;

  function createInstance() {
    const client = Stream.connect(apiKey, secret, appId);
    return client;
  }

  function createClientInstance(clientToken) {
    const client = Stream.connect(apiKey, clientToken, appId);
    return client;
  }

  function createChatInstance() {
    const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    return client;
  }

  return {
    /**
     *
     * @returns {Stream.StreamClient}
     */
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },

    /**
     *
     * @returns {StreamChat}
     */
    getChatInstance: () => {
      chatInstance = createChatInstance();
      return chatInstance;
    },

    /**
     *
     * @returns {Stream.StreamClient}
     */
    getClientInstance: (clientToken) => {
      clientInstance = createClientInstance(clientToken);
      return clientInstance;
    }
  };
})();

module.exports = GetstreamSingleton;
