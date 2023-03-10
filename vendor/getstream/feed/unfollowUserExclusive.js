const GetstreamConstant = require("../constant");
const GetstreamSingleton = require("../singleton")

const followUserExclusive = async(userIdFollower, userIdFollowed) => {
    const client = GetstreamSingleton.getInstance()
    const user = client.feed(GetstreamConstant.MAIN_FEED_NAME, userIdFollowed)
    return user.unfollow(GetstreamConstant.USER_EXCLUSIVE_FEED_NAME, userIdFollower);
}

module.exports = followUserExclusive