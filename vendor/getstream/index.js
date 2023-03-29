const Getstream = {
    core: {
        createUser: require('./core/createUser'),
        createToken: require('./core/createToken'),
        updateUserRemoveHumanId: require('./core/updateUserRemoveHumanId'),
    },
    chat: {
        createTokenChat: require('./chat/createTokenChat'),
        syncUser: require('./chat/syncUser')
    },
    feed: {
        comment: require('./feed/comment'),
        commentAnonymous: require('./feed/commentAnonymous'),
        commentChild: require('./feed/commentChild'),
        commentChildAnonymous: require('./feed/commentChildAnonymous'),
        createAnonymousPost: require('./feed/createAnonymousPost'),
        createPost: require('./feed/createPost'),
        getAnonymousFeeds: require('./feed/getAnonymousFeeds'),
        followAnonUser: require('./feed/followAnonUser'),
        followUser: require('./feed/followUser'),
        followUserExclusive: require('./feed/followUserExclusive'),
        unfollowAnonUser: require('./feed/unfollowAnonUser'),
        unfollowUser: require('./feed/unfollowUser'),
        unfollowUserExclusive: require('./feed/unfollowUserExclusive'),
    }
}

module.exports = Getstream