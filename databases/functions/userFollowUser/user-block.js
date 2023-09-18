const {Model} = require('sequelize');
/**
 *
 *  @typedef {Object} UserBlockUserOptionalParams
 * @property {string} [postId]
 * @property {Object} [transaction]
 */
/**
 *
 * @param {Model} userFollowUserModel
 * @param {Model} userFollowUserHistoryModel
 * @param {string} selfUserId
 * @param {string} targetUserId
 * @param {UserBlockUserOptionalParams} params
 */
module.exports = async (
  userFollowUserModel,
  userFollowUserHistoryModel,
  selfUserId,
  targetUserId,
  params = {}
) => {
  if (!targetUserId) throw new Error('targetUserId is required to block user');
  if (!selfUserId) throw new Error('selfUserId is required to block user');
  if (!userFollowUserModel) throw new Error('userFollowUserModel is required to block user');
  if (!userFollowUserHistoryModel)
    throw new Error('userFollowUserHistoryModel is required to block user');

  const {postId = '', transaction = null} = params;
  await userFollowUserModel.destroy(
    {
      where: {
        user_id_follower: targetUserId,
        user_id_followed: selfUserId
      }
    },
    {transaction, returning: true}
  );

  const history = {
    user_id_follower: targetUserId,
    user_id_followed: selfUserId,
    action: 'out',
    source: `postId:${postId}`
  };

  await userFollowUserHistoryModel.create(history, {transaction});
};
