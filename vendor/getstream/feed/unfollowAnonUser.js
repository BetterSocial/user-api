const GetstreamConstant = require("../constant");
const GetstreamSingleton = require("../singleton")

const unfollowAnonUser = async(token, userIdFollower, userIdFollowed) => {
    const client = GetstreamSingleton.getInstance()
    const user = client.feed(GetstreamConstant.MAIN_FEED_NAME, userIdFollower, token)
    return user.unfollow(GetstreamConstant.USER_ANON_FEED_NAME, userIdFollowed);
}

module.exports = unfollowAnonUser