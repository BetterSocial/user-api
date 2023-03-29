const GetstreamSingleton = require("../singleton");

const BetterSocialUpdateUserRemoveHumanId = async(userModelItem) => {
    const clientInstance = GetstreamSingleton.getInstance()
    let response = await clientInstance.user(userModelItem?.user_id).update({
        username: userModelItem?.username,
        profile_pic_url: userModelItem?.profile_pic_path,
    })

    return response
}

module.exports = BetterSocialUpdateUserRemoveHumanId;