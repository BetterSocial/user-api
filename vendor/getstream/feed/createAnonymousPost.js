const createToken = require("../core/createToken")
const GetstreamSingleton = require("../singleton")

/**
 * 
 * @param {String} userId 
 * @param {Object} data 
 * @returns 
 */
const createAnonymousPost = async(userId, data) => {
    const anonymousUserToken = await createToken(userId)
    const client = GetstreamSingleton.getClientInstance(anonymousUserToken)
    const userAnonymousFeed = client.feed('user_anon', client.userId, anonymousUserToken)
    return userAnonymousFeed.addActivity(data)
}

module.exports = createAnonymousPost