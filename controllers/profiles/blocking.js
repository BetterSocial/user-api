require('dotenv').config();
const env = process.env.NODE_ENV || 'development';
const {User, UserBlockedUser} = require('../../databases/models');

const Sequelize = require('sequelize');
const {QueryTypes} = require('sequelize');
const config = require('../../databases/config/database.js')[env];
const handleBlock = async (req, res) => {
  try {
    let sequelize;
    if (config.use_env_variable) {
      sequelize = new Sequelize(process.env[config.use_env_variable], config);
    } else {
      sequelize = new Sequelize(config.database, config.username, config.password, config);
    }

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
          WHERE "UserBlockedUser"."user_id_blocker" = :id AND "UserBlockedUser"."is_anonymous_user" = FALSE;`,
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
