const Stream = require('getstream');

const GetstreamSingleton = (() =>{
    let instance;

    function createInstance(){
        const client = Stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
        return client;
    }

    return {
        /**
         * 
         * @returns {Stream.StreamClient}
         */
        getInstance: () => {
            if(!instance){
                instance = createInstance();
            }
            return instance;
        }
    }
})()

module.exports = GetstreamSingleton;