const {Sequelize} = require('sequelize');

/**
 *
 * @param {Sequelize} sequelize;
 * @param {string} channelId;
 * @param {string[]} userIds;
 * @throws {Error}
 */
const getAllChatAnonimityUserInfo = async (sequelize, channelId, userIds = []) => {
  if (!sequelize) throw new Error('Sequelize is required');
  if (!channelId) throw new Error('Channel ID is required');

  if (userIds?.length === 0) return [];

  const query = `
    SELECT 
        users.user_id,
        users.username,
        users.is_anonymous,
        chat_anon_user_info.*
    FROM users
    LEFT JOIN chat_anon_user_info 
        ON users.user_id = CAST(chat_anon_user_info.my_anon_user_id as varchar) 
        AND chat_anon_user_info.channel_id = :channelId
    WHERE users.user_id IN (:userIds)`;

  try {
    const result = await sequelize.query(query, {
      replacements: {
        channelId,
        userIds
      },
      type: Sequelize.QueryTypes.SELECT
    });

    return result;
  } catch (e) {
    console.error('Failed to get chat anonimity user info', e);
    throw e;
  }
};

module.exports = getAllChatAnonimityUserInfo;
