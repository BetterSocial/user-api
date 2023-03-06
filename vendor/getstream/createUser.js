const getstreamService = require("../../services/getstream");
const createTokenChat = require("./createTokenChat");
const syncUser = require("./syncUser");

const createUser = async (user) => {
    let data = {
        human_id: user?.human_id,
        username: user?.username,
        profile_pic_url: user?.profile_pic_path,
        created_at: user?.createdAt,
    };

    console.log('data')
    console.log(data)
    console.log(user?.user_id)

    const user_id = user?.user_id;
    let userId = user_id?.toLowerCase();

    await getstreamService.createUser(data, userId);
    await createTokenChat(userId);
    await syncUser(userId);
    let token = await getstreamService.createToken(userId);
    
    return token
}

module.exports = createUser