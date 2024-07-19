const {sequelize, UserBlockedUser} = require('../../databases/models');
const _ = require('lodash');
const {QueryTypes} = require('sequelize');
const UsersFunction = require('../../databases/functions/users');
const {MINIMUM_KARMA_SCORE} = require('../../helpers/constants');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
const InitDiscoveryUserData = async (req, res) => {
  let {limit = 50, page = 0, allow_anon_dm} = req.query;
  page = parseInt(page);

  const {userId} = req;

  let where_anon_dm = '';
  if (allow_anon_dm) {
    allow_anon_dm = allow_anon_dm ? true : false;
    where_anon_dm = 'AND A.allow_anon_dm = :allow_anon_dm';
  }

  const blockedIds = await UsersFunction.getBlockedAndBlockerUserId(UserBlockedUser, req.userId);
  let filterBlockedUser = '';
  if (blockedIds.length > 0) {
    filterBlockedUser += `AND A.user_id NOT IN (${blockedIds
      .map((item) => `'${item}'`)
      .join(',')})`;
  }

  try {
    let totalDataQuery = `
    SELECT 
        count(A.user_id) as total_data
    FROM users A
    WHERE A.user_id != :userId AND A.is_anonymous = false AND A.is_banned = false ${where_anon_dm}`;

    let user_topics = await sequelize.query(
      `select tp.topic_id from topics as tp
      left join user_topics as utp on tp.topic_id = utp.topic_id
      where utp.user_id = :userId`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          userId
        }
      }
    );
    let topicIds = user_topics.map((topic) => topic.topic_id);

    const topicIdQuery = topicIds?.length > 0 ? `AND tp.topic_id in (:topicIds)` : '';

    const usersWithCommonFollowerQuery = `
        SELECT 
            A.user_id,
            A.country_code,
            A.username,
            A.real_name,
            A.created_at,
            A.updated_at,
            A.last_active_at,
            A.status,
            A.profile_pic_path,
            A.profile_pic_asset_id,
            A.profile_pic_public_id,
            A.bio,
            A.is_banned,
            A.is_anonymous,
            A.combined_user_score,
            A.karma_score,
            A.allow_anon_dm,
            A.only_received_dm_from_user_following,
            ARRAY( select name from topics as tp
              left join user_topics as utp on tp.topic_id = utp.topic_id
              where utp.user_id = A.user_id limit 3
            ) as community_info,
            ( select count(name) > 1 from topics as tp
							left join user_topics as utp on tp.topic_id = utp.topic_id
							where utp.user_id = A.user_id ${topicIdQuery} LIMIT 2
						) as community_info_result,
            (SELECT COUNT(*) FROM user_follow_user WHERE user_id_followed = A.user_id) AS followersCount,
            EXISTS (
                SELECT 1
                FROM user_follow_user AS f2
                WHERE f2.user_id_follower = :userId
                AND f2.user_id_followed = A.user_id
            ) AS is_followed,
            CommonUsers.common, 
            B.user_id_follower,
		        (A.last_active_at > NOW() - INTERVAL '7 days') AS recently_active
        from users A
        LEFT JOIN 
                (SELECT 
                    common.*,
                    joint.common,
                CASE WHEN joint.source = :userId THEN 1 ELSE 0 END as user_match
                FROM users common
                JOIN 
                    vwm_user_common_follower_count joint
                ON common.user_id = joint.target
                WHERE joint.source = :userId AND common.is_anonymous = false) CommonUsers
        ON CommonUsers.user_id = A.user_id
        LEFT JOIN user_follow_user B
        ON A.user_id = B.user_id_followed AND B.user_id_follower = :userId
        WHERE 
          A.user_id != :userId 
          AND A.is_anonymous = false 
          AND A.is_banned = false
          AND A.karma_score > :minimumKarmaScore
          AND A.user_id != :admin_user_id
          ${where_anon_dm} 
          ${filterBlockedUser}
        ORDER BY
          recently_active DESC,
          community_info_result DESC,
          A.karma_score DESC,
          followersCount DESC
        LIMIT :limit
        OFFSET :offset`;

    let usersWithCommonFollowerResult = await sequelize.query(usersWithCommonFollowerQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        topicIds,
        allow_anon_dm,
        limit: limit,
        offset: page * limit,
        minimumKarmaScore: MINIMUM_KARMA_SCORE,
        admin_user_id: process.env.BETTER_ADMIN_ID
      }
    });
    let suggestedUsers = usersWithCommonFollowerResult;

    let totalData = await sequelize.query(totalDataQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        allow_anon_dm
      },
      raw: true
    });
    totalData = totalData?.[0]?.total_data || 0;

    return res.status(200).json({
      success: true,
      message: `Fetch discovery data success`,
      suggestedUsers,
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

module.exports = InitDiscoveryUserData;
