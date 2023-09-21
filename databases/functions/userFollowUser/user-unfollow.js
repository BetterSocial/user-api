const {v4: uuidv4} = require('uuid');
const {sequelize} = require('../../models');

/**
 *
 * @param {Model} model
 * @param {RegisterBodyData.Users} users
 */
module.exports = async (
  userFollowUserModel,
  userFollowUserHistoryModel,
  userId,
  followedUser = null,
  followSource = '',
  transaction = null
) => {
  if (!followedUser) return;
  await sequelize.transaction(async (t) => {
    let userFollowed = await userFollowUserModel.findOne(
      {
        where: {
          user_id_follower: userId,
          user_id_followed: followedUser
        },
        raw: true
      },
      {transaction: t, returning: true}
    );

    await userFollowUserModel.destroy(
      {
        where: {
          follow_action_id: userFollowed.follow_action_id
        }
      },
      {transaction: t, returning: true}
    );

    await userFollowUserHistoryModel.create(
      {
        user_id_follower: userId,
        user_id_followed: followedUser,
        action: 'out',
        source: followSource.toLowerCase()
      },
      {transaction: t}
    );
  });
};
