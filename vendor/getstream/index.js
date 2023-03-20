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
        createPost: require('./feed/createPost'),
        createAnonymousPost: require('./feed/createAnonymousPost'),
        followAnonUser: require('./feed/followAnonUser'),
        followUser: require('./feed/followUser'),
        followUserExclusive: require('./feed/followUserExclusive'),
        unfollowAnonUser: require('./feed/unfollowAnonUser'),
        unfollowUser: require('./feed/unfollowUser'),
        unfollowUserExclusive: require('./feed/unfollowUserExclusive'),
    }
}

module.exports = Getstream