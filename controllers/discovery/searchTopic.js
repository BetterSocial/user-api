const {QueryTypes} = require('sequelize');
const {User, sequelize} = require('../../databases/models');
const UsersFunction = require('../../databases/functions/users');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
const Search = async (req, res) => {
  const {q} = req.query;

  const {userId} = req;
  const anonymousUser = await UsersFunction.findAnonymousUserId(User, userId, {raw: true});

  if (q.length < 2)
    return res.status(200).json({
      success: true,
      message: 'Your search characters is too few, please input 3 or more characters for search'
    });

  try {
    const topics = await sequelize.query(
      `SELECT 
        C.*,
        COUNT(*) as followersCount,
        A.user_id as user_id_follower,
        (
          (1 + 
                  CASE
                      when COUNT(A.user_id) < 20 then COUNT(A.user_id)
                  ELSE 
                      20
                  END
            )
            *
            (0.2 + (SELECT 
                    count(D.post_id) 
                    FROM posts D 
                    INNER JOIN post_topics E 
                    ON D.post_id = E.post_id 
                    INNER JOIN topics F 
                    ON E.topic_id = F.topic_id 
                    WHERE F.topic_id = A.topic_id 
                    AND D.created_at > current_date - interval '7 days'
            ) ^ 0.5)
        ) AS ordering_score
        FROM topics C
        LEFT JOIN  user_topics A
            ON C.topic_id = A.topic_id
            AND A.user_id in (:userId, :anonymousUserId)
        WHERE 
            C.name LIKE :likeQuery
        GROUP BY A.topic_id, C.topic_id, A.user_id
        ORDER BY 
              ordering_score DESC
        LIMIT :limit`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          userId,
          anonymousUserId: anonymousUser?.user_id,
          likeQuery: `%${q}%`,
          limit: 50
        }
      }
    );

    const followedTopic = topics.filter((item) => item.user_id_follower !== null);

    const unfollowedTopic = topics.filter((item) => item.user_id_follower === null);

    return res.status(200).json({
      success: true,
      message: `Search ${q}`,
      followedTopic,
      unfollowedTopic
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

module.exports = Search;
