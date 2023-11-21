const {sequelize} = require('../../databases/models');
const _ = require('lodash');
const {QueryTypes} = require('sequelize');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
const InitDiscoveryUserData = async (req, res) => {
  const {limit = 50, page = 0} = req.body;

  const {userId} = req;

  try {
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
            CommonUsers.common, B.user_id_follower from users A
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
        WHERE A.user_id != :userId AND A.is_anonymous = false AND A.is_banned = false
        ORDER BY
        A.karma_score DESC,
        COALESCE(CommonUsers.common, -1) DESC, 
        COALESCE(CommonUsers.user_match, -1) DESC,
        COALESCE(B.user_id_follower, '') DESC
        LIMIT :limit
        OFFSET :offset`;

    let usersWithCommonFollowerResult = await sequelize.query(usersWithCommonFollowerQuery, {
      type: QueryTypes.SELECT,
      replacements: {
        userId,
        limit: limit,
        offset: page * limit
      }
    });
    let suggestedUsers = usersWithCommonFollowerResult;

    return res.status(200).json({
      success: true,
      message: `Fetch discovery data success`,
      suggestedUsers,
      nextPage: page + 1
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
