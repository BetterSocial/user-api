/**
 *
 * @param {Model} userFollowUserModel
 * @param {RegisterBodyData.Users} users
 */
module.exports = async (userFollowUserModel, userIdFollower, _transaction = null) => {
  const followingUsers = await userFollowUserModel
    .findAll({
      where: {
        user_id_follower: userIdFollower
      },
      attributes: ['user_id_followed'],
      raw: true
    })
    .then((users) => users.map((user) => user.user_id_followed));

  return followingUsers;
};
