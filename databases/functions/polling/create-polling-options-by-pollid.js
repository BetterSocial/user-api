/**
 * @typedef {Object} PollOptionsDataParam
 * @property {String} text
 */

const {Sequelize} = require('sequelize');

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
  const {pollId, polls} = data;

  const pollsOptionUUIDs = [];
  polls.forEach(async (poll, i) => {
    const pollOption = await sequelizeModel.query(
      `INSERT INTO polling_option 
        (polling_id, option, counter, created_at, updated_at)
        VALUES (:pollingId, :option, :counter, :createdAt, :updatedAt)
        RETURNING polling_option_id`,
      {
        replacements: {
          pollingId: pollId,
          option: poll?.text,
          counter: 0,
          createdAt: new Date(new Date().setSeconds(new Date().getSeconds() + i)).toISOString(),
          updatedAt: new Date(new Date().setSeconds(new Date().getSeconds() + i)).toISOString()
        },
        transaction
      }
    );

    const pollOptionUUID = pollOption[0][0].polling_option_id;
    pollsOptionUUIDs.push(pollOptionUUID);
  });

  return pollsOptionUUIDs;
};
