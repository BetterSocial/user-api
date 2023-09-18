/**
 *
 * @typedef {Object} CreatePollingDataParams
 * @property {String} userId
 * @property {String} postId
 * @property {String} message
 * @property {boolean} multiplechoice
 * @property {String} createdAt
 * @property {String} updatedAt
 */

const {Sequelize} = require('sequelize');

/**
 *
 * @param {Sequelize} sequelizeModel
 * @param {CreatePollingDataParams} data
 * @returns
 */
module.exports = async (sequelizeModel, data, transaction) => {
  const {userId, postId, message, multiplechoice, createdAt, updatedAt} = data;
  let poll = await sequelizeModel.query(
    `INSERT INTO polling 
          (question, post_id, user_id, flg_multiple, created_at, updated_at) 
          VALUES (:question, :post_id, :user_id, :flg_multiple, :created_at, :updated_at)
          RETURNING polling_id`,
    {
      replacements: {
        question: message,
        post_id: postId,
        user_id: userId,
        flg_multiple: multiplechoice,
        created_at: createdAt,
        updated_at: updatedAt
      },
      type: sequelizeModel.QueryTypes.INSERT,
      transaction
    }
  );

  return poll[0][0]?.polling_id;
};
