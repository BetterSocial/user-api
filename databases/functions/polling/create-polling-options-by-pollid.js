const { Sequelize } = require("sequelize");

/**
 * @typedef {Object} PollOptionsDataParam
 * @property {String} text
 */

/**
 * @typedef {Object} CreatePollingOptionDataParam
 * @property {String} pollId
 * @property {PollOptionsDataParam[]} polls
 * @property {String} createdAt
 * @property {String} updatedAt
 */

/**
 * 
 * @param {Sequelize} sequelizeModel 
 * @param {CreatePollingOptionDataParam} data 
 */
module.exports = async (sequelizeModel, data, transaction) => {
    const { pollId, polls, createdAt, updatedAt } = data;

    let pollsOptionUUIDs = [];
    for (let poll of polls) {
        let pollOption = await sequelizeModel.query(
            `INSERT INTO polling_option 
        (polling_id, option, counter, created_at, updated_at)
        VALUES (:pollingId, :option, :counter, :createdAt, :updatedAt)
        RETURNING polling_option_id`,
            {
                replacements: {
                    pollingId: pollId,
                    option: poll?.text,
                    counter: 0,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                },
                transaction
            }
        );

        let pollOptionUUID = pollOption[0][0].polling_option_id;
        pollsOptionUUIDs.push(pollOptionUUID);
    }

    return pollsOptionUUIDs
}