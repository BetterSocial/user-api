/**
 *
 * @param {Model} userFollowUserModel
 * @param {RegisterBodyData.Users} users
 */
module.exports = async (userFollowUserModel, _userModel, userIdFollower, _transaction = null) => {
  let isBlurredPost = false;

  const signUserList = await userFollowUserModel.findAll({
    where: {
      user_id_follower: userIdFollower,
      is_anonymous: false
    },
    raw: true
  });

  if (signUserList.length <= 7) {
    isBlurredPost = true;
  }

  return isBlurredPost;
};
