const {sequelize} = require('../../../../databases/models');

const refreshAllMaterializedViews = async () => {
  await sequelize.query('REFRESH MATERIALIZED VIEW vwm_user_follower_count;');
  await sequelize.query('REFRESH MATERIALIZED VIEW vwm_user_common_follower_count;');
  await sequelize.query('REFRESH MATERIALIZED VIEW vwm_user_location_follower_count;');
  await sequelize.query('REFRESH MATERIALIZED VIEW vwm_user_topic_follower_count_rank;');
};

module.exports = refreshAllMaterializedViews;
