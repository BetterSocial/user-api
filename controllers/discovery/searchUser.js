const {QueryTypes} = require('sequelize');
const {sequelize, UserBlockedUser} = require('../../databases/models');
const UsersFunction = require('../../databases/functions/users');
const {MINIMUM_KARMA_SCORE} = require('../../helpers/constants');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
const SearchUser = async (req, res) => {
  const {q, limit = 50, allow_anon_dm} = req.query;
  const {userId} = req;

  let where_anon_dm = '';
  if (allow_anon_dm) {
    where_anon_dm = 'AND u.allow_anon_dm = :allow_anon_dm';
  }

  const blockedIds = await UsersFunction.getBlockedAndBlockerUserId(UserBlockedUser, req.userId);
  let filterBlockedUser = '';
  if (blockedIds.length > 0) {
    filterBlockedUser += `AND u.user_id NOT IN (${blockedIds
      .map((item) => `'${item}'`)
      .join(',')})`;
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
          ARRAY( select name from topics as tp
            left join user_topics as utp on tp.topic_id = utp.topic_id
            where utp.user_id = u.user_id limit 3
          ) as community_info,
          (SELECT COUNT(*) FROM user_follow_user WHERE user_id_followed = u.user_id) AS followersCount,
          (
              SELECT count(name) > 1
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
                  LIMIT 2
              ) AS subquery
          ) AS community_info_result,
          EXISTS (
              SELECT 1
              FROM user_follow_user AS f2
              WHERE f2.user_id_follower = :userId
              AND f2.user_id_followed = u.user_id
          ) AS is_followed,
          (SELECT user_id_follower FROM user_follow_user WHERE user_id_followed = u.user_id AND user_id_follower = :userId) AS user_id_follower,
					(u.last_active_at > NOW() - INTERVAL '7 days') AS recently_active
      FROM 
          users AS u
      WHERE 
          (u.username ILIKE :likeQuery
          ${where_anon_dm}
          ${filterBlockedUser}
          AND u.user_id != :userId
          AND u.is_anonymous = false
          AND u.is_banned = false
          AND u.user_id != :admin_user_id
          AND u.verified_status != 'UNVERIFIED') 
      ORDER BY  
          recently_active DESC,
          community_info_result DESC,
          u.karma_score DESC,
          followersCount DESC
      LIMIT :limit`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          likeQuery: '%' + q + '%',
          allow_anon_dm,
          userId,
          minimumKarmaScore: MINIMUM_KARMA_SCORE,
          admin_user_id: process.env.BETTER_ADMIN_ID,
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
