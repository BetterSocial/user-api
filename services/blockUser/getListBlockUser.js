const {UserBlockedUser} = require('../../databases/models');
const {BLOCK_FEED_KEY} = require('../../helpers/constants');
const {getIdBlockFeed} = require('../../utils/block');
const {getValue, setValue} = require('../redis');
const {Op} = require('sequelize');

module.exports = async (userId) => {
  try {
    const MY_KEY = getIdBlockFeed(userId);
    let cache = await getValue(MY_KEY);
    if (cache) {
      return cache;
    }
    let blockUser = await UserBlockedUser.findAll({
      attributes: ['user_id_blocked'],
      where: {
        user_id_blocker: userId
      }
    });

    let blockedUser = await UserBlockedUser.findAll({
      attributes: ['user_id_blocker'],
      where: {
        user_id_blocked: userId
      }
    });

    let newarrBlockuser = blockedUser.map((item) => {
      return {
        user_id_blocked: item.user_id_blocker
      };
    });
    let newArr = [...blockUser, ...newarrBlockuser];
    const valueString = JSON.stringify(newArr);
    setValue(MY_KEY, valueString);
    return valueString;
  } catch (error) {
    throw error;
  }
};
