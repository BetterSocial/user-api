const CryptoUtils = require("../../../utils/crypto")

module.exports = async (userModel, userId) => {
    const user = await userModel.findOne({
        where: {
            user_id: userId,
        },
        raw: true
    })

    if(user?.is_anonymous) return CryptoUtils.decryptAnonymousUserId(user?.encrypted)
    return user?.user_id
}