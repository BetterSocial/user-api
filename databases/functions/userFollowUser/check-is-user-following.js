const { v4: uuidv4 } = require("uuid")

/**
 * 
 * @param {Model} userFollowUserModel 
 * @param {RegisterBodyData.Users} users 
 */
module.exports = async (userFollowUserModel, userIdFollower, userIdFollowed, transaction = null) => {
    // User Follow User
   const userFollowed = await userFollowUserModel.findOne({
        where: {
            user_id_follower: userIdFollower,
            user_id_followed: userIdFollowed
        },
        raw: true
   })

   return userFollowed !== null
}