const { Model } = require("sequelize")

/**
 * 
 * @param {Model} fcmTokenModel 
 * @param {String} userId 
 */
module.exports = async (fcmTokenModel, userId) => {
    const userTargetToken = await fcmTokenModel.findOne({
        where: {
            user_id: userIdFollowed
        },
        raw: true
    })

    return userTargetToken
}