const GetstreamSingleton = require("../singleton")

const createAnonymousPost = async(token, data) => {
    const client = GetstreamSingleton.getInstance()
    const userAnonymousFeed = client.feed('user_anon', client.userId, token)
    return userAnonymousFeed.addActivity(data)
}

module.exports = createAnonymousPost