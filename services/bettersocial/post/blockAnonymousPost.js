const UserBlockUserFunction = require('../../../databases/functions/userBlockUser')
const UserFollowUserFunction = require('../../../databases/functions/userFollowUser')
const UsersFunction = require('../../../databases/functions/users')
const { User, UserFollowUser, UserFollowUserHistory, UserBlockedUser, UserBlockedUserHistory, sequelize } = require('../../../databases/models')
const Getstream = require('../../../vendor/getstream')
const RedisBlockHelper = require('../../redis/helper/RedisBlockHelper')

/**
 * @typedef {Object} BetterSocialBlockAnonymousPostV2OptionalParams
 * @property {Object[]} [reason]
 * @property {string} [message]
 */
/**
 * 
 * @param {string} token 
 * @param {string} selfUserId 
 * @param {string} postId 
 * @param {string} source 
 * @param {BetterSocialBlockAnonymousPostV2OptionalParams} params 
 * @returns 
 */
const BetterSocialBlockAnonymousPost = async (token, selfUserId, postId, source, params = {}) => {
    let post = null
    const { reason = [], message = "" } = params
    const selfAnonymousUserId = await UsersFunction.findAnonymousUserId(User, selfUserId)

    try {
        post = await Getstream.feed.getPlainFeedById(postId)
    } catch (e) {
        return {
            isSuccess: false,
            message: e?.message || "Error in fetching getstream post by post id"
        }
    }
    
    const authorAnonymousUserId = post?.actor?.id || null

    console.log(`${selfAnonymousUserId?.user_id} vs ${authorAnonymousUserId}`)
    if (selfAnonymousUserId?.user_id === authorAnonymousUserId) return {
        isSuccess: false,
        message: "You can't block your own post"
    }

    try {
        await sequelize.transaction(async (t) => {
            await UserFollowUserFunction.userBlock(
                UserFollowUser,
                UserFollowUserHistory,
                selfUserId,
                authorAnonymousUserId,
                { transaction: t, postId }
            )

            await UserBlockUserFunction.userBlock(
                UserBlockedUser,
                UserBlockedUserHistory,
                selfUserId,
                authorAnonymousUserId,
                source,
                { transaction: t, message, postId, reason, isAnonymous: true }
            )
        });
    } catch (e) {
        console.log('Error in block user v2 sql transaction')
        return {
            isSuccess: false,
            message: e?.message || "Error in block user v2 sql transaction"
        }
    }

    try {
        await RedisBlockHelper.resetBlockUserList(selfUserId)
    } catch (e) {
        console.log('Error in block user v2 redis')
        console.log(e)
        return {
            isSuccess: false,
            message: e?.message || "Error in block user v2 redis"
        }
    }

    try {
        await Getstream.feed.unfollowAnonUserByBlockAnonPost(token, selfUserId, authorAnonymousUserId)
        return {
            isSuccess: true,
            message: "This Anonymous post has been blocked successfully"
        }
    } catch(e) {
        return {
            isSuccess: false,
            message: e?.message || "Error in block anonymous post"
        }
    }
}

module.exports = BetterSocialBlockAnonymousPost