const CryptoUtils = require("../../../utils/crypto")

module.exports = async (userModel, userId) => {
    const user = await userModel.findOne({
        where: {
            user_id: userId,
        },
        raw: true
    })

    return user?.user_id
}