const {QueryTypes} = require('sequelize');
const {User, sequelize} = require('../../databases/models');
const UsersFunction = require('../../databases/functions/users');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
const InitDiscoveryTopicData = async (req, res) => {
  let {limit = 10, page = 0} = req.query;
  page = parseInt(page);

  const userId = req.userId;
  const anonymousUser = await UsersFunction.findAnonymousUserId(User, userId, {raw: true});

  try {
    let totalDataQuery = `SELECT 
                              count(A.topic_id) as total_data
                          FROM topics A`;
    let suggestedTopicsQuery = `
                          SELECT 
                            C.*,
                            COUNT(*) as common,
                            A.user_id as user_id_follower,
                            ((1 + 
                              CASE
                                WHEN (select count(*) from user_follow_user ufu where user_id_follower = :userId and user_id_followed in (
                                    select user_id from user_topics ut where topic_id = C.topic_id
                                  )) > 20 THEN 20
                            ELSE 
                                (select count(*) from user_follow_user ufu where user_id_follower = :userId and user_id_followed in (
                                  select user_id from user_topics ut where topic_id = C.topic_id
                                ))
                            END
                            )
                              *
                              (0.2 + (SELECT 
                              count(D.post_id) 
                              FROM posts D 
                              INNER JOIN post_topics E 
                              ON D.post_id = E.post_id 
                              WHERE E.topic_id = C.topic_id 
                              AND D.created_at > current_date - interval '7 days'
                                ) ^ 0.5)) AS ordering_score
                            FROM user_topics A 
                            INNER JOIN user_topics B 
                                ON A.topic_id = B.topic_id
                                AND A.user_id in (:userId, :anonymousUserId)
                            RIGHT JOIN topics C 
                                ON C.topic_id = A.topic_id
                            GROUP BY A.topic_id, C.topic_id, A.user_id
                            ORDER BY 
                              user_id_follower,
                              ordering_score DESC
                            LIMIT :limit
                            OFFSET :offset`;

    let topicWithCommonFollowerResult = await sequelize.query(suggestedTopicsQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        anonymousUserId: anonymousUser?.user_id,
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
