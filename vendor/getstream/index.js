const Getstream = {
    core: {
        createUser: require('./core/createUser'),
        createToken: require('./core/createToken'),
    },
    chat: {
        createTokenChat: require('./chat/createTokenChat'),
        syncUser: require('./chat/syncUser')
    },
    feed: {
        
    }
}

module.exports = Getstream