const CryptoUtils = require("../../../utils/crypto")

module.exports = async (userModel, anonUserId) => {
    const anonymousUser = await userModel.findOne({
        where: {
            user_id: anonUserId,
            is_anonymous: true
        },
        raw: true
    })

    return CryptoUtils.decryptAnonymousUserId(anonymousUser?.bio)
}