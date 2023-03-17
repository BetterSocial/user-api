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

const { Sequelize, Transaction } = require("sequelize");

/**
 * 
 * @param {Sequelize} sequelizeModel 
 * @param {CreatePollPostDataParams} data 
 * @param {Transaction} tranzaction
 * @returns 
 */
module.exports = async (sequelizeModel, data, transaction) => {
    const { userId, anonimity, expiredAt, resUrl = '', createdAt, updatedAt } = data;

    let post = await sequelizeModel.query(
        `INSERT INTO posts (author_user_id, anonymous, duration, topic_id, post_content, created_at, updated_at)
          VALUES(:authorUserId, :anonymous, :duration, :topicId, :postContent, :createdAt, :updatedAt)
          RETURNING post_id`,
        {
            replacements: {
                authorUserId: userId,
                anonymous: anonimity,
                duration: expiredAt,
                topicId: 1,
                postContent: resUrl,
                createdAt: createdAt,
                updatedAt: updatedAt,
            },
            transaction
        }
    );

    return post[0][0]?.post_id;
}