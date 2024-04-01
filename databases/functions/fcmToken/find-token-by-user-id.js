const {Model} = require('sequelize');

/**
 *
 * @param {Model} fcmTokenModel
 * @param {String} userId
 */
module.exports = async (fcmTokenModel, userId) => {
  const userTargetToken = await fcmTokenModel.findOne({
    where: {
      user_id: userId
    },
    order: [['updated_at', 'DESC']],
    raw: true
  });

  return userTargetToken;
};
