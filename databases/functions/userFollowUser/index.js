const UserFollowUserFunction = {
  registerAddFollowUser: require('./user-follow-add'),
  checkIsUserFollowing: require('./check-is-user-following'),
  checkIsBlurredPost: require('./check-is-blurred-post'),
  checkTargetUserFollowStatus: require('./check-target-user-follow-status'),
  checkTargetUserFollowStatusBatch: require('./check-target-user-follow-status-batch'),
  userBlock: require('./user-block'),
  userUnfollow: require('./user-unfollow')
};

module.exports = UserFollowUserFunction;
