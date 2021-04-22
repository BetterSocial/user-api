// dont remove env
require("dotenv").config();
const env = process.env.NODE_ENV || "development";
const { UserFollowUser } = require("../../databases/models");

const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
const config = require("../../databases/config/database.js")[env];

module.exports = async (req, res) => {
  let id = req.params.id;
  console.log(id);
  let sequelize;
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else {
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );
  }
  const following = await sequelize.query(
    `SELECT "UserFollowUser"."follow_action_id", "UserFollowUser"."user_id_follower", "UserFollowUser"."user_id_followed", "user"."user_id" AS "user.user_id", "user"."human_id" AS "user.human_id", "user"."country_code" AS "user.country_code", "user"."username" AS "user.username", "user"."real_name" AS "user.real_name", "user"."created_at" AS "user.createdAt", "user"."updated_at" AS "user.updatedAt", "user"."last_active_at" AS "user.last_active_at", "user"."profile_pic_path" AS "user.profile_pic_path", "user"."profile_pic_asset_id" AS "user.profile_pic_asset_id", "user"."profile_pic_public_id" AS "user.profile_pic_public_id", "user"."status" AS "user.status" FROM "user_follow_user" AS "UserFollowUser" LEFT OUTER JOIN "users" AS "user" ON "UserFollowUser"."user_id_followed" = "user"."user_id" WHERE "UserFollowUser"."user_id_follower" = '${id}';`,
    {
      nest: true,
      type: QueryTypes.SELECT,
    }
  );

  // const following = await UserFollowUser.findAll({
  //   whare: {
  //     user_id_follower: "d4ec3968-80a0-477b-8b16-5c8010b",
  //   },
  // });

  if (following === null) {
    return res.status(404).json({
      code: 404,
      status: "error",
      message: "user following not found",
    });
  } else {
    return res.json({
      status: "success",
      code: 200,
      data: following,
    });
  }
};
