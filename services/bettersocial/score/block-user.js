const moment = require("moment");
const { addForUnblockUser, addForBlockUser } = require("../../score");

const BetterSocialScoreBlockUser = (selfUserId, targetUserId, postId) => {
    const scoringProcessData = {
        user_id: selfUserId,
        feed_id: postId,
        unblocked_user_id: targetUserId,
        activity_time: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
    };

    addForBlockUser(scoringProcessData).catch((e) => {
        console.log("Error in adding block user score");
        console.log(e);
    })
}

module.exports = BetterSocialScoreBlockUser