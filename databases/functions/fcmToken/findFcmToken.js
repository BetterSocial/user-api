const { Model } = require('sequelize');

/**
 *
 * @param {Model} fcmTokenModel
 * @param {String} token
 */
module.exports = async (fcmTokenModel, token) => {
    const userToken = await fcmTokenModel.findOne({
        where: {
            token,
        },
    });
    
    return userToken;
};
