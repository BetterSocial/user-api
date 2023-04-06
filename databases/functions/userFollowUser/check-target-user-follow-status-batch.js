const { Model, Transaction } = require("sequelize")

/**
 * 
 * @param {Model} userFollowUserModel 
 * @param {string} selfUserId 
 * @param {string} targetUserId 
 * @param {Transaction} transaction 
 * @returns 
 */


module.exports = async (userFollowUserModel, selfUserId, targetUserIds = [], transaction = null) => {
    if (userFollowUserModel === null) throw new Error("userFollowUserModel is required")
    if (selfUserId === null) throw new Error("selfUserId is required")

    // if(selfUserId === targetUserId) return {
    //     isTargetFollowingMe: false,
    //     isMeFollowingTarget: false
    // }

    if (targetUserIds?.length === 0) return {}

    let targetHashes = {}

    for (let targetUserId of targetUserIds) {
        targetHashes[targetUserId] = {
            isTargetFollowingMe: false,
            isMeFollowingTarget: false
        }
    }

    const myFollowers = await userFollowUserModel.findAll({
        where: {
            user_id_follower: targetUserIds,
            user_id_followed: selfUserId
        },

        raw: true,
    })

    const myFollowings = await userFollowUserModel.findAll({
        where: {
            user_id_follower: selfUserId,
            user_id_followed: targetUserIds
        },

        raw: true
    })

    for(let myFollower of myFollowers) {
        targetHashes[myFollower.user_id_follower] = {
            ...targetHashes[myFollower.user_id_follower],
            isTargetFollowingMe: true
        }
    }

    for(let myFollowing of myFollowings) {
        targetHashes[myFollowing.user_id_followed] = {
            ...targetHashes[myFollowing.user_id_followed],
            isMeFollowingTarget: true
        }
    }

    return {
        targetHashes
    }
}