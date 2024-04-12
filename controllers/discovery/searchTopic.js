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
            "Topic".*,
            count("topicFollower"."user_id") 
                AS "followersCount",
            (SELECT "f"."user_id" AS "user_id_follower" 
              FROM "user_topics" AS f 
              WHERE 
                ("f"."user_id" = :userId 
                OR "f"."user_id" = :anonymousUserId)
                AND "f"."topic_id" = "Topic"."topic_id"),
            (1 + COUNT("topicFollower"."user_id")*(0.2 + (SELECT 
              count("D"."post_id") 
              FROM "posts" as "D" 
              INNER JOIN "post_topics" as "E" 
              ON "D"."post_id" = "E"."post_id" 
              INNER JOIN "topics" as "F" 
              ON "E"."topic_id" = "F"."topic_id" 
              WHERE "F"."topic_id" = "Topic"."topic_id" 
              AND "D"."created_at" > current_date - interval '7 days'
            ) ^ 0.5)) AS ordering_score
        FROM "topics" 
            AS "Topic" 
        LEFT OUTER JOIN "user_topics" 
            AS "topicFollower" 
        ON "Topic"."topic_id" = 
            "topicFollower"."topic_id" 
        WHERE 
            "Topic"."name" ILIKE :likeQuery
        GROUP BY 
            "Topic"."topic_id"
        ORDER BY
            "ordering_score" DESC
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
