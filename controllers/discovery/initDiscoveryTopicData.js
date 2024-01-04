const {QueryTypes} = require('sequelize');
const {sequelize} = require('../../databases/models');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
const InitDiscoveryTopicData = async (req, res) => {
  let {limit = 10, page = 0} = req.query;

  const userId = req.userId;

  try {
    let totalDataQuery = `SELECT 
                              count(A.topic_id) as total_data
                          FROM topics A`;

    let suggestedTopicsQuery = `SELECT 
                C.*, 
                A.topic_id, 
                COUNT(*) as common,
                A.user_id as user_id_follower
            FROM user_topics A 
            INNER JOIN user_topics B 
                ON A.topic_id = B.topic_id 
                AND A.user_id = :userId
            RIGHT JOIN topics C 
                ON C.topic_id = A.topic_id
            GROUP BY A.topic_id, C.topic_id, A.user_id
            ORDER BY 
                common DESC, 
                A.topic_id ASC,
                COALESCE(A.user_id, '') ASC
            LIMIT :limit
            OFFSET :offset`;

    let topicWithCommonFollowerResult = await sequelize.query(suggestedTopicsQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        limit: limit,
        offset: page * limit
      }
    });
    let suggestedTopics = topicWithCommonFollowerResult;

    let totalData = await sequelize.query(totalDataQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        userId
      },
      raw: true
    });
    totalData = totalData?.[0]?.total_data || 0;

    return res.status(200).json({
      success: true,
      message: `Fetch discovery data success`,
      suggestedTopics,
      page: page + 1,
      total_page: totalData > 0 && limit > 0 ? Math.ceil(totalData / limit) : 0,
      limit: limit,
      offset: page * limit
    });
  } catch (e) {
    console.log('e');
    console.log(e);
    return res.status(200).json({
      success: false,
      message: e
    });
  }
};

module.exports = InitDiscoveryTopicData;
