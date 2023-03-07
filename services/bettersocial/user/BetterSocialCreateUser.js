const Getstream = require("../../../vendor/getstream");

/**
 * 
 * @param {GetstreamCreateUserParam} user 
 * @returns 
 */
const BetterSocialCreateUser = async (user) => {
    console.log('user?.user_id in create user')
    console.log(user?.user_id)
    if(user?.user_id === null || user?.user_id === undefined) throw new Error("user_id is required to create user");
    const {user_id} = user

    await Getstream.core.createUser(user);
    await Getstream.chat.createTokenChat(user_id);
    await Getstream.chat.syncUser(user_id);

    return Getstream.core.createToken(user_id);
}

module.exports = BetterSocialCreateUser