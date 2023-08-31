/* eslint-disable no-unused-vars */
/**
 *
 * @typedef {Object} CreatePollPostDataParams
 * @property {String} userId
 * @property {boolean} anonimity
 * @property {String} expiredAt
 * @property {String[]} resUrl
 * @property {String} createdAt
 * @property {String} updatedAt
 */

const {Sequelize, Transaction} = require('sequelize');

/**
 *
 * @param {Sequelize} sequelizeModel
 * @param {CreatePollPostDataParams} data
 * @param {Transaction} tranzaction
 * @returns
 */
module.exports = async (sequelizeModel, data, transaction) => {
  const {userId, anonimity, expiredAt, resUrl = '', createdAt, updatedAt} = data;

  const post = await sequelizeModel.query(
    `INSERT INTO posts (author_user_id, anonymous, duration, post_content, created_at, updated_at)
          VALUES(:authorUserId, :anonymous, :duration, :postContent, :createdAt, :updatedAt)
          RETURNING post_id`,
    {
      replacements: {
        authorUserId: userId,
        anonymous: anonimity,
        duration: expiredAt,
        postContent: resUrl,
        createdAt,
        updatedAt
      },
      transaction
    }
  );

  return post[0][0]?.post_id;
};
