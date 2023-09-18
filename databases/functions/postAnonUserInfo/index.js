const PostAnonUserInfoFunction = {
  checkSelfUsernameInPost: require('./check_self_username_in_post'),
  checkAnotherUsernameInPost: require('./check_another_anon_username_in_post'),
  createAnonUserInfoInPost: require('./create_anon_user_info_in_post'),
  createAnonUserInfoInComment: require('./create_anon_user_info_in_comment')
};

module.exports = PostAnonUserInfoFunction;
