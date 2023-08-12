const GetstreamConstant = require("../constant");
const GetstreamSingleton = require("../singleton");
const UsersFunction = require('../../../databases/functions/users')
const { User } = require('../../../databases/models')

const follow = async(token, userIdFollower, userIdFollowed) => {
    const client = GetstreamSingleton.getInstance()
    // get requested user feed
    const feed = client.feed(GetstreamConstant.MAIN_FEED_FOLLOWING_NAME, userIdFollower, token);
    // follow targeted user feed
    const anonymousUserId = await UsersFunction.findAnonymousUserId(User, userIdFollowed)
    feed.follow(GetstreamConstant.USER_ANON_FEED_NAME, anonymousUserId);
    return feed.follow(GetstreamConstant.USER_EXCLUSIVE_FEED_NAME, userIdFollowed);
}

const unfollow = async(token, userIdFollower, userIdFollowed) => {
    const client = GetstreamSingleton.getInstance();
    // follow targeted user feed
    const feed = client.feed(GetstreamConstant.MAIN_FEED_FOLLOWING_NAME, userIdFollower, token)
    // un-follow targeted user feed
    const anonymousUserId = await UsersFunction.findAnonymousUserId(User, userIdFollowed)
    feed.unfollow(GetstreamConstant.USER_ANON_FEED_NAME, anonymousUserId);
    return feed.unfollow(GetstreamConstant.USER_EXCLUSIVE_FEED_NAME, userIdFollowed);
}

module.exports = {
    follow,
    unfollow
}