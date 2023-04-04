/**
 * 
 * @typedef {Object} InsertAnonUserInfoParams
 * @property {string} anonUserId
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
 * @param {InsertAnonUserInfoParams} data 
 * @param {Transaction} transaction 
 * @returns 
 */
module.exports = async(postAnonUserInfoModel, data, transaction = null) => {
    let postAnonUserInfo = await postAnonUserInfoModel.findOne({
        where: {
            post_id: data.postId,
            anon_user_id: data?.anonUserId,
        },
        raw: true
    }, {transaction})

    if(postAnonUserInfo) return postAnonUserInfo
    
    await postAnonUserInfoModel.create({
        post_id: data.postId,
        anon_user_id: data?.anonUserId,
        anon_user_info_emoji_name: data?.anonUserInfoEmojiName,
        anon_user_info_emoji_code: data?.anonUserInfoEmojiCode,
        anon_user_info_color_name: data?.anonUserInfoColorName,
        anon_user_info_color_code: data?.anonUserInfoColorCode,
    }, {transaction});
}