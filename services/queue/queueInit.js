const { QUEUE_ADD_USER_POST_COMMENT, QUEUE_DELETE_USER_POST_COMMENT, EVENT_FOLLOW_F2_USER, EVENT_UNFOLLOW_F2_USER } = require("../score/constant");
const BetterSocialQueue = require("./BetterSocialQueue");

const addCommentToDbQueue = BetterSocialQueue.generate(QUEUE_ADD_USER_POST_COMMENT)
const deleteCommentByBlockTriggerQueue = BetterSocialQueue.generate(QUEUE_DELETE_USER_POST_COMMENT)
// const followMainFeedF2 = BetterSocialQueue.generate(EVENT_FOLLOW_F2_USER);
// const unFollowMainFeedF2 = BetterSocialQueue.generate(EVENT_UNFOLLOW_F2_USER);

const QueueInstance = {
    addCommentToDbQueue,
    deleteCommentByBlockTriggerQueue,
    // followMainFeedF2,
    // unFollowMainFeedF2
}

module.exports = QueueInstance