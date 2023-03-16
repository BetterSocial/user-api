const Stream = require('getstream');

const GetstreamSingleton = (() => {
    let instance;
    let clientInstance;
    const apiKey = process.env.API_KEY
    const secret = process.env.SECRET
    const appId = process.env.APP_ID

    function createInstance() {
        const client = Stream.connect(apiKey, secret, appId);
        return client;
    }

    function createClientInstance(clientToken) {
        const client = Stream.connect(apiKey, clientToken, appId);
        return client
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
         * @returns {Stream.StreamClient}
         */
        getClientInstance: (clientToken) => {
            clientInstance = createClientInstance(clientToken);
            return clientInstance;
        }
    }
})()

module.exports = GetstreamSingleton;