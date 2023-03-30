const GetstreamConstant = require("../constant");
const GetstreamSingleton = require("../singleton")

const unfollowAnonUserByBlockAnonPost = async (token, userIdFollower, anonUserIdFollowed) => {
    const client = GetstreamSingleton.getInstance()
    const user = client.feed(GetstreamConstant.MAIN_FEED_NAME, userIdFollower, token)
    return user.unfollow(GetstreamConstant.USER_ANON_FEED_NAME, anonUserIdFollowed);
}

module.exports = unfollowAnonUserByBlockAnonPost