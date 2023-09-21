const {Model} = require('sequelize');

/**
 *
 * @param {Model} fcmTokenModel
 * @param {String} user_id
 * @param {String} token
 */
module.exports = async (fcmTokenModel, user_id, token) => {
  const userToken = await fcmTokenModel.findOne({
    where: {
      user_id,
      token
    }
  });

  return userToken;
};
