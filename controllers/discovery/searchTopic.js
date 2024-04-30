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
      `
    WITH post_counts AS (
        SELECT 
            E.topic_id,
            count(D.post_id) AS post_count
        FROM posts D 
        INNER JOIN post_topics E 
        ON D.post_id = E.post_id 
        WHERE D.created_at > current_date - interval '7 days'
        GROUP BY E.topic_id
    ), user_follow_counts AS (
        SELECT 
            ut.topic_id,
            count(ufu.user_id_followed) AS friend_count
        FROM user_follow_user ufu
        INNER JOIN user_topics ut ON ufu.user_id_followed = ut.user_id
        WHERE ufu.user_id_follower = :userId
        GROUP BY ut.topic_id
    ), topic_followers AS (
        SELECT 
            topic_id,
            count(*) AS followers_count
        FROM user_topics
        GROUP BY topic_id
    ), user_topic_follow_counts AS (
        SELECT 
            ut.topic_id,
            count(*) AS user_follow_count
        FROM user_topics ut
        WHERE ut.user_id IN (:userId, :anonymousUserId)
        GROUP BY ut.topic_id
    )
    SELECT 
        C.*,
        C.topic_id,
        COALESCE(tf.followers_count, 0) AS followersCount,
        utfc.user_follow_count AS user_id_follower,
        ((1 + 
            CASE
                WHEN COALESCE(ufc.friend_count, 0) > 20 THEN 20
                ELSE COALESCE(ufc.friend_count, 0)
            END)
            *
            (0.2 + POW(COALESCE(pc.post_count, 0), 0.5))
        ) AS ordering_score
    FROM topics C 
    LEFT JOIN post_counts pc ON C.topic_id = pc.topic_id
    LEFT JOIN user_follow_counts ufc ON C.topic_id = ufc.topic_id
    LEFT JOIN topic_followers tf ON C.topic_id = tf.topic_id
    LEFT JOIN user_topic_follow_counts utfc ON C.topic_id = utfc.topic_id
    WHERE C.name ILIKE :likeQuery
    GROUP BY C.name, C.topic_id, pc.post_count, ufc.friend_count, tf.followers_count, utfc.user_follow_count
    ORDER BY ordering_score DESC
    LIMIT :limit;`,
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
