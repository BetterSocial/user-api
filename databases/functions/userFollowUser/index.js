const UserFollowUserFunction = {
    registerAddFollowUser: require('./user-follow-add'),
    checkIsUserFollowing: require('./check-is-user-following'),
    checkTargetUserFollowStatus: require('./check-target-user-follow-status'),
    userBlock: require('./user-block'),
    userUnfollow: require('./user-unfollow'),
}

module.exports = UserFollowUserFunction;