const QueueInstance = require("./queueInit");
const { v4: uuid } = require('uuid');
const Bull = require("bull");

/**
 * 
 * @param {AddCommentToDbQueuePayload} data 
 * @returns 
 */
const addCommentToDb= (data) => {
    /**
     * @type {Bull.JobOptions}
     */
    const options = {
        jobId: uuid(),
        removeOnComplete: true
    }

    QueueInstance.addCommentToDbQueue.add(data, options)
    return
}

/**
 * 
 * @param {DeleteCommentByBlockTriggerQueue} data 
 * @returns 
 */
const deleteCommentByBlock= (data) => {
    /**
     * @type {Bull.JobOptions}
     */
    const options = {
        jobId: uuid(),
        removeOnComplete: true
    }

    QueueInstance.addCommentToDbQueue.add(data, options)
    return
}

const QueueTrigger = {
    addCommentToDb,
    deleteCommentByBlock
}

module.exports = QueueTrigger
