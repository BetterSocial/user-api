const {responseError, responseSuccess} = require('../../utils/Responses');
const {sequelize} = require('../../databases/models');

module.exports = async (req, res) => {
  try {
    const {limit = 50, offset = 0, allow_anon_dm = ''} = req.query;

    let filterAllowDm = '';
    if (allow_anon_dm !== '') {
      filterAllowDm = `AND users.allow_anon_dm = ${allow_anon_dm}`;
    }

    let queryResults = await sequelize.query(
      `SELECT 
        user_id,
        country_code,
        username,
        real_name,
        created_at,
        updated_at,
        last_active_at,
        status,
        profile_pic_path,
        profile_pic_asset_id,
        profile_pic_public_id,
        bio,
        is_banned,
        users.is_anonymous,
        users.allow_anon_dm
        from users INNER JOIN user_follow_user ON users.user_id = user_follow_user.user_id_followed 
        WHERE 
          users.user_id != :userId 
          AND user_follow_user.user_id_follower = :userId 
          AND users.is_anonymous = false
          ${filterAllowDm}
      UNION
      SELECT 
        user_id,
        country_code,
        username,
        real_name,
        created_at,
        updated_at,
        last_active_at,
        status,
        profile_pic_path,
        profile_pic_asset_id,
        profile_pic_public_id,
        bio,
        is_banned,
        users.is_anonymous,
        users.allow_anon_dm
        from users INNER JOIN user_follow_user ON users.user_id = user_follow_user.user_id_follower 
        WHERE 
          users.user_id != :userId 
          AND user_follow_user.user_id_followed = :userId 
          AND users.is_anonymous = false
          ${filterAllowDm}
      LIMIT :limit
      OFFSET :offset`,
      {
        replacements: {userId: req.userId, limit, offset},
        type: sequelize.QueryTypes.SELECT
      }
    );

    const users = queryResults;
    res.status(200).json(responseSuccess('Success get populate', users));
    // ambil user yang memfollow kita
  } catch (error) {
    console.log(error);
    res.status(500).json(responseError('Internal server error', null, 500));
  }
};
