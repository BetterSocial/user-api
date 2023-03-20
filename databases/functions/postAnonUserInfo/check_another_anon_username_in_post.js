const { Model, Transaction, Op } = require("sequelize")
const UsersFunction = require("../users")

/**
 * 
 * @typedef {Object} CheckOtherUsernameInPostParams
 * @property {string} userId
 * @property {string} postId
 * @property {string} anonUserInfoEmojiName
 * @property {string} anonUserInfoEmojiCode
 * @property {string} anonUserInfoColorName
 * @property {string} anonUserInfoColorCode
 */
/**
 * 
 * @param {Model} postAnonUserInfoModel 
 * @param {Model} userModel 
 * @param {CheckOtherUsernameInPostParams} data 
 * @param {Transaction} transaction 
 * @returns 
 */
module.exports = async(postAnonUserInfoModel, userModel, data, transaction = null) => {
    const {userId, postId} = data

    const anonymousUser = await UsersFunction.findAnonymousUserId(userModel, userId)
    let postAnonUserInfo = await postAnonUserInfoModel.findOne({
        where: {
            post_id: postId,
            anon_user_info_color_name: data?.anonUserInfoColorName,
            anon_user_info_color_code: data?.anonUserInfoColorCode,
            anon_user_info_emoji_name: data?.anonUserInfoEmojiName,
            anon_user_info_emoji_code: data?.anonUserInfoEmojiCode,
            anon_user_id: {
                [Op.not]: anonymousUser?.user_id
            }
        },
        raw: true
    }, {transaction})

    return postAnonUserInfo
}