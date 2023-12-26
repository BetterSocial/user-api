const findAnonymousUserId = require('../users/find-anonymous-user-id');

/**
 *
 * @param {Model} userFollowUserModel
 * @param {RegisterBodyData.Users} users
 */
module.exports = async (userFollowUserModel, userModel, userIdFollower, _transaction = null) => {
  let isBlurredPost = false;

  let [signUserList, anonUserList] = await Promise.all([
    userFollowUserModel.findAll({
      where: {
        user_id_follower: userIdFollower,
        is_anonymous: false
      },
      raw: true
    }),
    userFollowUserModel.findAll({
      where: {
        user_id_follower: userIdFollower,
        is_anonymous: true
      },
      raw: true
    })
  ]);

  let anonUserFromSignList = [];
  await Promise.all(
    signUserList.map(async (user) => {
      let anonUserFromSign = await findAnonymousUserId(userModel, user.user_id_followed);
      anonUserFromSignList.push(anonUserFromSign.user_id);
    })
  );

  let anonUserWithoutSignUser = anonUserList.filter((user) => {
    return !anonUserFromSignList.includes(user.user_id_followed);
  });

  if (signUserList.length + anonUserWithoutSignUser.length <= 7) {
    isBlurredPost = true;
  }

  return isBlurredPost;
};
