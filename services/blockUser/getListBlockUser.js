const { UserBlockedUser } = require('../../databases/models');
const { BLOCK_FEED_KEY } = require("../../helpers/constants");
const { getValue, setValue } = require('../redis');
module.exports = async (userId) => {
  try {
    const MY_KEY = BLOCK_FEED_KEY + userId;
    let cache = await getValue(MY_KEY);
    if (cache) {
      return cache;
    }
    let blockUser = await UserBlockedUser.findAll({
      attributes: ["user_id_blocked"],
      where: {
        user_id_blocker: userId,
      },
    });
    const valueString = JSON.stringify(blockUser);
    setValue(MY_KEY, valueString);
    return valueString;
  } catch (error) {
    throw error;
  }
};
