/* eslint-disable no-restricted-syntax */
// eslint-disable-next-line no-unused-vars
const {Model, Transaction} = require('sequelize');

/**
 *
 * @param {Model} userFollowUserModel
 * @param {string} selfUserId
 * @param {string} targetUserId
 * @param {Transaction} transaction
 * @returns
 */

module.exports = async (userFollowUserModel, userModel, selfUserId, targetUserIds = []) => {
  if (userFollowUserModel === null) throw new Error('userFollowUserModel is required');
  if (selfUserId === null) throw new Error('selfUserId is required');

  if (targetUserIds?.length === 0) return {};

  const targetHashes = {};

  for (const targetUserId of targetUserIds) {
    targetHashes[targetUserId] = {
      isTargetFollowingMe: false,
      isMeFollowingTarget: false,
      isAnonymous: true,
      isExist: false
    };
  }

  const myFollowers = await userFollowUserModel.findAll({
    where: {
      user_id_follower: targetUserIds,
      user_id_followed: selfUserId
    },

    raw: true
  });

  const myFollowings = await userFollowUserModel.findAll({
    where: {
      user_id_follower: selfUserId,
      user_id_followed: targetUserIds
    },

    raw: true
  });

  const isAnonymousCheck = await userModel.findAll({
    where: {
      user_id: targetUserIds
    },
    attributes: ['user_id', 'is_anonymous'],

    raw: true
  });

  for (const myFollower of myFollowers) {
    targetHashes[myFollower.user_id_follower] = {
      ...targetHashes[myFollower.user_id_follower],
      isTargetFollowingMe: true
    };
  }

  for (const myFollowing of myFollowings) {
    targetHashes[myFollowing.user_id_followed] = {
      ...targetHashes[myFollowing.user_id_followed],
      isMeFollowingTarget: true
    };
  }

  for (const users of isAnonymousCheck) {
    targetHashes[users.user_id] = {
      ...targetHashes[users.user_id],
      isAnonymous: users.is_anonymous,
      isExist: true
    };
  }

  return {
    targetHashes
  };
};
