const {QueryTypes} = require('sequelize');
const {sequelize} = require('../../databases/models');
const handleBlock = async (req, res) => {
  try {
    const allBlock = await sequelize.query(
      `SELECT 
          "UserBlockedUser"."blocked_action_id", 
          "UserBlockedUser"."user_id_blocker", 
          "UserBlockedUser"."user_id_blocked", 
          "user"."user_id" AS "user.user_id", 
          "user"."human_id" AS "user.human_id", 
          "user"."country_code" AS "user.country_code", 
          "user"."username" AS "user.username", 
          "user"."real_name" AS "user.real_name", 
          "user"."created_at" AS "user.createdAt", 
          "user"."updated_at" AS "user.updatedAt", 
          "user"."last_active_at" AS "user.last_active_at", 
          "user"."profile_pic_path" AS "user.profile_pic_path", 
          "user"."profile_pic_asset_id" AS "user.profile_pic_asset_id", 
          "user"."profile_pic_public_id" AS "user.profile_pic_public_id", 
          "user"."status" AS "user.status" FROM "user_blocked_user" AS "UserBlockedUser" 
          INNER JOIN "users" AS "user" ON "UserBlockedUser"."user_id_blocked" = "user"."user_id" 
          WHERE "UserBlockedUser"."user_id_blocker" = :id AND "user"."is_anonymous" = FALSE;`,
      {
        nest: true,
        type: QueryTypes.SELECT,
        replacements: {
          id: req?.userId
        }
      }
    );
    return res.status(200).send({success: true, data: allBlock});
  } catch (e) {
    return res.status(400).send({success: false, error: e});
  }
};

module.exports = {
  handleBlock
};
