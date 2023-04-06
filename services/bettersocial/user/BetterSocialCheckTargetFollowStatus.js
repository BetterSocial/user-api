const UserFollowUserFunction = require("../../../databases/functions/userFollowUser")
const {UserFollowUser} = require("../../../databases/models")

/**
 * 
 * @param {string} selfUserId 
 * @param {string} targetUserId 
 */
const BetterSocialCheckTargetFollowStatus = async(selfUserId, targetUserId) => {
    try {
        const followingStatus = await UserFollowUserFunction.checkTargetUserFollowStatus(UserFollowUser, selfUserId, targetUserId)

        return {
            isSuccess: true,
            ...followingStatus
        }
    } catch (e) {
        console.log(e)
        return {
            isSuccess: false,
            message: e?.message
        }
    }
}

module.exports = BetterSocialCheckTargetFollowStatus