const { QUEUE_ADD_USER_POST_COMMENT, QUEUE_DELETE_USER_POST_COMMENT } = require("../score/constant");
const BetterSocialQueue = require("./BetterSocialQueue");

const addCommentToDbQueue = BetterSocialQueue.generate(QUEUE_ADD_USER_POST_COMMENT)
const deleteCommentByBlockTriggerQueue = BetterSocialQueue.generate(QUEUE_DELETE_USER_POST_COMMENT)

const QueueInstance = {
    addCommentToDbQueue,
    deleteCommentByBlockTriggerQueue
}

module.exports = QueueInstance