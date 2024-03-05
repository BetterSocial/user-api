const {QueryTypes} = require('sequelize');

const {sequelize} = require('../../databases/models');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
const SearchUser = async (req, res) => {
  const {q, limit = 50, allow_anon_dm} = req.query;
  const {userId} = req;

  if (q.length < 2)
    return res.status(200).json({
      success: true,
      message: 'Your search characters is too few, please input 3 or more characters for search'
    });

  let where_anon_dm = '';
  if (allow_anon_dm) {
    where_anon_dm = 'AND u.allow_anon_dm = :allow_anon_dm';
  }

  try {
    const users = await sequelize.query(
      `SELECT 
          u.user_id,
          u.human_id,
          u.country_code,
          u.username,
          u.real_name,
          u.created_at,
          u.updated_at,
          u.last_active_at,
          u.status,
          u.profile_pic_path,
          u.bio,
          u.is_banned,
          u.is_anonymous,
          u.allow_anon_dm,
          u.only_received_dm_from_user_following,
          u.is_backdoor_user,
          u.blocked_by_admin,
          u.verified_status,
          u.combined_user_score,
          u.karma_score,
          u.is_karma_unlocked,
          (SELECT COUNT(*) FROM user_follow_user WHERE user_id_followed = u.user_id) AS followersCount,
          ARRAY(
              SELECT name
              FROM (
                  SELECT name, ROW_NUMBER() OVER (ORDER BY tp.topic_id) AS row_num
                  FROM topics AS tp
                  LEFT JOIN user_topics AS utp ON tp.topic_id = utp.topic_id
                  WHERE utp.user_id = u.user_id AND tp.topic_id IN (
                      SELECT tp.topic_id 
                      FROM topics AS tp
                      LEFT JOIN user_topics AS utp ON tp.topic_id = utp.topic_id
                      WHERE utp.user_id = :userId
                  )
              ) AS subquery
              WHERE row_num <= 3
          ) AS community_info,
          EXISTS (
              SELECT 1
              FROM user_follow_user AS f2
              WHERE f2.user_id_follower = :userId
              AND f2.user_id_followed = u.user_id
          ) AS is_followed,
          (SELECT user_id_follower FROM user_follow_user WHERE user_id_followed = u.user_id AND user_id_follower = :userId) AS user_id_follower
      FROM 
          users AS u
      WHERE 
          (u.username ILIKE :likeQuery
          ${where_anon_dm}
          AND u.user_id != :userId
          AND u.is_anonymous = false
          AND u.is_banned = false 
          AND u.verified_status != 'UNVERIFIED') 
      ORDER BY  
          is_followed DESC,
          u.karma_score DESC,
          followersCount DESC
      LIMIT :limit`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          likeQuery: '%' + q + '%',
          allow_anon_dm,
          userId,
          limit
        }
      }
    );

    let followedUsers = [];
    let unfollowedUsers = [];
    users.forEach((item) => {
      if (item.user_id_follower !== null) {
        followedUsers.push(item);
      } else {
        unfollowedUsers.push(item);
      }
    });

    return res.status(200).json({
      success: true,
      message: `Search ${q}`,
      followedUsers,
      unfollowedUsers
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

module.exports = SearchUser;
