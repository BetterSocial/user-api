const stream = require("getstream");
const client = stream.connect(process.env.API_KEY, process.env.SECRET);

/**
 * 
 * @param {GetstreamCreateUserParam} user 
 * @returns 
 */
const createUser = async (user) => {
    let data = {
        human_id: user?.human_id,
        username: user?.username,
        profile_pic_url: user?.profile_pic_path,
        created_at: user?.createdAt,
    };

    const user_id = user?.user_id;
    let userId = user_id?.toLowerCase();

    return await client
        .user(userId)
        .create(data)
}

module.exports = createUser