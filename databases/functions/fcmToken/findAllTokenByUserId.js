const {Model} = require('sequelize');

/**
 *
 * @param {Model} fcmTokenModel
 * @param {String} userId
 */
module.exports = async (fcmTokenModel, userId) => {
  const userTargetTokens = await fcmTokenModel.findAll({
    where: {
      user_id: userId
    }
  });

  return userTargetTokens;
};
