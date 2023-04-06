const { Model, Transaction } = require("sequelize")

/**
 * 
 * @param {Model} userFollowUserModel 
 * @param {string} selfUserId 
 * @param {string} targetUserId 
 * @param {Transaction} transaction 
 * @returns 
 */


module.exports = async (userFollowUserModel, selfUserId, targetUserId, transaction = null) => {
    if(userFollowUserModel === null) throw new Error("userFollowUserModel is required")
    if(selfUserId === null) throw new Error("selfUserId is required")
    if(targetUserId === null) throw new Error("targetUserId is required")

    if(selfUserId === targetUserId) return {
        isTargetFollowingMe: false,
        isMeFollowingTarget: false
    }

    const isTargetFollowingMe = await userFollowUserModel.findOne({
        where: {
            user_id_follower: targetUserId,
            user_id_followed: selfUserId
        },
    })

    const isMeFollowingTarget = await userFollowUserModel.findOne({
        where: {
            user_id_follower: selfUserId,
            user_id_followed: targetUserId
        },
    })

    return {
        isTargetFollowingMe: isTargetFollowingMe !== null,
        isMeFollowingTarget: isMeFollowingTarget !== null
    }
}