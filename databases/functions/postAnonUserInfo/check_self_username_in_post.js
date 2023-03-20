const { Model, Transaction } = require("sequelize")
const UsersFunction = require("../users")

/**
 * 
 * @typedef {Object} CheckSelfUsernameInPostParams
 * @property {string} userId
 * @property {string} postId
 */
/**
 * 
 * @param {Model} postAnonUserInfoModel 
 * @param {Model} userModel 
 * @param {CheckSelfUsernameInPostParams} data 
 * @param {Transaction} transaction 
 * @returns 
 */
module.exports = async(postAnonUserInfoModel, userModel, data, transaction = null) => {
    const {userId, postId} = data

    const anonymousUser = await UsersFunction.findAnonymousUserId(userModel, userId)
    let postAnonUserInfo = await postAnonUserInfoModel.findOne({
        where: {
            post_id: postId,
            anon_user_id: anonymousUser?.user_id
        },
        raw: true
    }, {transaction})

    return postAnonUserInfo
}