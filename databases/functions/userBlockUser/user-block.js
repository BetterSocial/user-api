const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

/**
 * @typedef {Object} UserBlockUserOptionalParams
 * @property {string} [postId]
 * @property {string} [reason]
 * @property {string} [message]
 * @property {boolean} [isAnonymous = false]
 * @property {Object} [transaction]
 * 
 */

/**
 * 
 * @param {Model} userBlockedUserModel 
 * @param {Model} userBlockedUserHistoryModel 
 * @param {string} selfUserId 
 * @param {string} targetUserId 
 * @param {string} source 
 * @param {UserBlockUserOptionalParams} optionalParams 
 */
module.exports = async (
    userBlockedUserModel,
    userBlockedUserHistoryModel,
    selfUserId,
    targetUserId,
    source,
    optionalParams = {}) => {

    if (!targetUserId) throw new Error("targetUserId is required to block user");
    if (!selfUserId) throw new Error("selfUserId is required to block user");
    if (!userBlockedUserModel) throw new Error("userBlockedUserModel is required to block user");
    if (!userBlockedUserHistoryModel) throw new Error("userBlockedUserHistoryModel is required to block user");
    if (!source) throw new Error("source is required to block user");

    const {
        message = "",
        postId = null,
        reason = null,
        isAnonymous = false,
        transaction = null } = optionalParams

    const reasonBlocked = {
        reason,
        message
    }

    const isTargetExist = await userBlockedUserModel.findOne({
        where: {
            user_id_blocker: selfUserId,
            user_id_blocked: targetUserId,
        },
    }, { transaction });

    if(isTargetExist) return;

    const userBlock = {
        blocked_action_id: uuidv4(),
        user_id_blocker: selfUserId,
        user_id_blocked: targetUserId,
        reason_blocked: reasonBlocked,
        is_anonymous_user: isAnonymous,
        post_id: postId
    };

    await userBlockedUserModel.create(userBlock, {
        transaction,
    });

    const userBlockHistory = {
        user_blocked_user_history_id: uuidv4(),
        user_id_blocker: selfUserId,
        user_id_blocked: targetUserId,
        action: "out",
        source: source,
    };
    await userBlockedUserHistoryModel.create(userBlockHistory, { transaction });

}