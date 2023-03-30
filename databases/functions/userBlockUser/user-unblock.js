module.exports = async (userBlockedUserModel, selfUserId, targetUserId, optionalParam) => {
    if (!targetUserId) throw new Error("targetUserId is required to unblock user");
    if (!selfUserId) throw new Error("selfUserId is required to unblock user");
    if (!userBlockedUserModel) throw new Error("userBlockedUserModel is required to unblock user");

    const { transaction = null } = optionalParam

    await userBlockedUserModel.destroy({
        where: {
            user_id_blocker: selfUserId,
            user_id_blocked: targetUserId
        }},
    { transaction })

    return { isSuccess: true };
}