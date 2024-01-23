const {MINIMUM_BLUR_USER_FOLLOWING} = require('../../../helpers/constants');

/**
 *
 * @param {Model} userFollowUserModel
 * @param {RegisterBodyData.Users} users
 */
module.exports = async (userFollowUserModel, userIdFollower, _transaction = null) => {
  let isBlurredPost = false;

  const signUserList = await userFollowUserModel.findAll({
    where: {
      user_id_follower: userIdFollower,
      is_anonymous: false
    },
    limit: MINIMUM_BLUR_USER_FOLLOWING + 1,
    raw: true
  });

  if (signUserList.length <= MINIMUM_BLUR_USER_FOLLOWING) {
    isBlurredPost = true;
  }

  return isBlurredPost;
};
