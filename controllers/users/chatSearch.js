const {QueryTypes} = require('sequelize');
const {sequelize} = require('../../databases/models');

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const chatSearch = async (req, res) => {
  const {q = '', limit = 50, offset = 0} = req.query;
  const userId = req.userId;

  let followedUserSearchQuery = `
        SELECT B.user_id_follower, B.user_id_followed, * 
        FROM users A 
        INNER JOIN user_follow_user B
        ON B.user_id_follower = :userId AND B.user_id_followed = A.user_id
        WHERE 
            A.username ILIKE :query AND 
            A.user_id != :userId
        LIMIT 5
        OFFSET :offset`;

  try {
    let followedUserSearchQueryResult = await sequelize.query(followedUserSearchQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        offset: parseInt(offset),
        query: `%${q}%`,
        userId
      }
    });
    let followed = followedUserSearchQueryResult;

    const followedIds = followed?.map((user) => user.user_id);
    let additionalQuery = followed?.length > 0 ? `AND A.user_id NOT IN (:followedIds)` : '';

    let moreUserSearchQuery = `
  SELECT B.user_id_follower, B.user_id_followed, * 
  FROM users A 
  LEFT JOIN user_follow_user B
  ON B.user_id_followed = :userId AND B.user_id_follower = A.user_id
  WHERE 
      A.username ILIKE :query AND 
      A.user_id != :userId AND
      A.is_anonymous = false
      ${additionalQuery}
  ORDER BY B.user_id_followed
  LIMIT :limit
  OFFSET :offset`;

    const userOffset = parseInt(offset) - parseInt(followed?.length || 0);

    let moreUserSearchQueryResult = await sequelize.query(moreUserSearchQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        offset: userOffset < 0 ? 0 : userOffset,
        query: `%${q}%`,
        userId,
        limit: limit - (followed?.length || 0),
        followedIds
      }
    });
    let moreUsers = moreUserSearchQueryResult;

    const countUsers = followed?.length + moreUsers?.length;

    return res.status(200).json({
      success: true,
      message: `search result for ${q}`,
      next: parseInt(countUsers) + parseInt(offset),
      followed,
      moreUsers
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

module.exports = chatSearch;
