const Stream = require('getstream');

const GetstreamSingleton = (() => {
    let instance;
    let clientInstance;

    const apiKey = process.env.API_KEY
    const secret = process.env.SECRET
    const appId = process.env.APP_ID

    function createToken(userId) {
        if (!userId) throw new Error("userId is required");

        const DAYS_IN_SECONDS = 24 * 60 * 60
        let exp = Math.floor(Date.now() / 1000) + (30 * DAYS_IN_SECONDS);
        const tempClient = Stream.connect(apiKey, appId)
        return tempClient.createUserToken(userId, { exp: exp });
    }

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
        },
    }
})()

module.exports = GetstreamSingleton;