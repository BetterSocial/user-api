// dont remove env
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const Sequelize = require('sequelize');
const {QueryTypes} = require('sequelize');
const config = require('../../databases/config/database')[env];

module.exports = async (req, res) => {
  const userId = req.userId;

  let sequelize;
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }

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
  const similarTopicQuery =
    topicIds.length > 0
      ? `ARRAY( select name from topics as tp
        left join user_topics as utp on tp.topic_id = utp.topic_id
        where utp.user_id = "user".user_id and tp.topic_id in (:topicIds) limit 3
      )`
      : 'ARRAY[]::text[]';

  const following = await sequelize.query(
    `SELECT 
      "UserFollowUser"."follow_action_id", 
      "UserFollowUser"."user_id_follower", 
      "UserFollowUser"."user_id_followed", 
      "user"."user_id" AS "user.user_id", 
      "user"."country_code" AS "user.country_code", 
      "user"."username" AS "user.username", 
      "user"."real_name" AS "user.real_name", 
      "user"."created_at" AS "user.createdAt", 
      "user"."updated_at" AS "user.updatedAt", 
      "user"."last_active_at" AS "user.last_active_at", 
      "user"."profile_pic_path" AS "user.profile_pic_path", 
      "user"."profile_pic_asset_id" AS "user.profile_pic_asset_id", 
      "user"."profile_pic_public_id" AS "user.profile_pic_public_id", 
      "user"."status" AS "user.status",
      "user"."karma_score" AS "user.karma_score",
      ${similarTopicQuery} as "user.community_info"
      FROM "user_follow_user" AS "UserFollowUser"
      LEFT OUTER JOIN 
      "users" AS "user" ON "UserFollowUser"."user_id_followed" = "user"."user_id"
      WHERE "UserFollowUser"."user_id_follower" = :userId AND "UserFollowUser"."user_id_followed" != :userId AND "user"."is_anonymous" = false;`,
    {
      nest: true,
      type: QueryTypes.SELECT,
      replacements: {userId, topicIds}
    }
  );

  if (following === null) {
    return res.status(404).json({
      code: 404,
      status: 'error',
      message: 'user following not found'
    });
  }
  return res.json({
    status: 'success',
    code: 200,
    data: following
  });
};
