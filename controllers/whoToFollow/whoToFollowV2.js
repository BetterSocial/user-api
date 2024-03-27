/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const {sequelize} = require('../../databases/models');

module.exports = async (req, res) => {
  const {topics, locations, page} = req.query;
  const result = [];

  const limit = 7;
  const offset = (page - 1) * limit;
  const allUserIds = [];

  try {
    //TOPICS
    if (topics) {
      const topicsDetail = `SELECT * FROM topics WHERE topic_id IN (:topics)`;

      const topicsDetailQueryResult = await await sequelize.query(topicsDetail, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          topics
        }
      });
      const topicsDetailResult = topicsDetailQueryResult;

      for (const indexTopic in topicsDetailResult) {
        const topic = topicsDetailResult[indexTopic];

        const topicsQuery = `SELECT 
                            a.user_id,
                            a.country_code,
                            a.username,
                            a.real_name,
                            a.created_at,
                            a.updated_at,
                            a.last_active_at,
                            a.status,
                            a.profile_pic_path,
                            a.profile_pic_asset_id,
                            a.profile_pic_public_id,
                            a.bio,
                            a.is_banned,
                            a.is_anonymous,
                            a.encrypted,
                            a.allow_anon_dm,
                            a.only_received_dm_from_user_following,
                            a.is_backdoor_user,
                            a.followers_count,
                            a.karma_score,
                            b.topic_id
                          FROM users a
                          INNER JOIN user_topics b ON a.user_id = b.user_id
                          WHERE 
                            a.is_anonymous = false
                            AND a.is_banned = false
                            AND a.blocked_by_admin = false
                            AND a.karma_score > 45
                            AND a.user_id != :admin_user_id
                            AND b.topic_id = :topic_id
                          ORDER BY 
                            a.last_active_at DESC,
                            CASE WHEN a.profile_pic_path != '%default-profile-picture%' THEN 0 ELSE 1 END,
                            a.followers_count DESC
                          LIMIT :limit OFFSET :offset`;

        const userTopicFollowerQueryResult = await sequelize.query(topicsQuery, {
          type: sequelize.QueryTypes.SELECT,
          replacements: {
            topic_id: topic.topic_id,
            admin_user_id: process.env.BETTER_ADMIN_ID,
            limit,
            offset
          }
        });
        const userTopicFollower = userTopicFollowerQueryResult;

        const tempUsers = [];
        for (const indexUserTopic in userTopicFollower) {
          const userTopic = userTopicFollower[indexUserTopic];

          tempUsers.push({
            ...userTopic,
            viewtype: 'user'
          });

          if (!allUserIds.includes(userTopic.user_id)) {
            allUserIds.push(userTopic.user_id);
          }
        }

        if (tempUsers.length > 0) {
          result.push({
            viewtype: 'labeltopic',
            name: topic.name,
            id: topic.topic_id,
            users_count: tempUsers.length,
            users: tempUsers
          });
        }
      }
    }
    // END TOPICS

    //LOCATIONS
    if (locations) {
      const locationsDetail = `SELECT * FROM location WHERE location_id IN (:locations)`;

      const locationsDetailQueryResult = await await sequelize.query(locationsDetail, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          locations
        }
      });
      const locationsDetailResult = locationsDetailQueryResult;

      for (const indexLocation in locationsDetailResult) {
        const location = locationsDetailResult[indexLocation];

        const locationsQuery = `SELECT 
                                a.user_id,
                                a.human_id,
                                a.country_code,
                                a.username,
                                a.real_name,
                                a.created_at,
                                a.updated_at,
                                a.last_active_at,
                                a.status,
                                a.profile_pic_path,
                                a.profile_pic_asset_id,
                                a.profile_pic_public_id,
                                a.bio,
                                a.is_banned,
                                a.is_anonymous,
                                a.encrypted,
                                a.allow_anon_dm,
                                a.only_received_dm_from_user_following,
                                a.is_backdoor_user,
                                a.followers_count,
                                a.karma_score,
                                b.location_id
                              FROM users a
                              INNER JOIN user_location b ON a.user_id = b.user_id
                              WHERE 
                                a.is_anonymous = false
                                AND a.is_banned = false
                                AND a.blocked_by_admin = false
                                AND a.karma_score > 45
                                AND b.location_id = :location_id
                              ORDER BY 
                                a.last_active_at DESC,
                                CASE WHEN a.profile_pic_path != '%default-profile-picture%' THEN 0 ELSE 1 END,
                                a.followers_count DESC
                              LIMIT :limit OFFSET :offset`;

        const userLocationFollowerQueryResult = await sequelize.query(locationsQuery, {
          type: sequelize.QueryTypes.SELECT,
          replacements: {
            location_id: location.location_id,
            admin_user_id: process.env.BETTER_ADMIN_ID,
            limit,
            offset
          }
        });
        const userLocationsFollower = userLocationFollowerQueryResult;

        const tempUsers = [];
        for (const indexUserLocation in userLocationsFollower) {
          const userLocation = userLocationsFollower[indexUserLocation];

          tempUsers.push({
            ...userLocation,
            viewtype: 'user'
          });

          if (!allUserIds.includes(userLocation.user_id)) {
            allUserIds.push(userLocation.user_id);
          }
        }

        if (tempUsers.length > 0) {
          result.push({
            viewtype: 'labellocation',
            ...location,
            users_count: tempUsers.length,
            users: tempUsers
          });
        }
      }
    }
    //END LOCATIONS

    //OTHER USERS
    if (topics) {
      allUserIds.push(process.env.BETTER_ADMIN_ID);
      const otherTopicsQuery = `SELECT 
                            a.user_id,
                            a.country_code,
                            a.username,
                            a.real_name,
                            a.created_at,
                            a.updated_at,
                            a.last_active_at,
                            a.status,
                            a.profile_pic_path,
                            a.profile_pic_asset_id,
                            a.profile_pic_public_id,
                            a.bio,
                            a.is_banned,
                            a.is_anonymous,
                            a.encrypted,
                            a.allow_anon_dm,
                            a.only_received_dm_from_user_following,
                            a.is_backdoor_user,
                            a.followers_count,
                            a.karma_score
                          FROM users a
                          INNER JOIN user_topics b ON a.user_id = b.user_id
                          WHERE 
                            a.is_anonymous = false
                            AND a.is_banned = false
                            AND a.blocked_by_admin = false
                            AND a.karma_score > 45
                            AND b.topic_id NOT IN (:topics)
                            AND a.user_id NOT IN (:allUserIds)
                          GROUP BY a.user_id
                          ORDER BY 
                            a.last_active_at DESC,
                            CASE WHEN a.profile_pic_path != '%default-profile-picture%' THEN 0 ELSE 1 END,
                            a.followers_count DESC
                          LIMIT :limit OFFSET :offset`;

      const userOtherTopicFollowerQueryResult = await sequelize.query(otherTopicsQuery, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          topics,
          allUserIds,
          limit,
          offset
        }
      });
      const userOtherTopicFollower = userOtherTopicFollowerQueryResult;

      const tempUsers = [];
      for (const indexUserOtherTopic in userOtherTopicFollower) {
        const userTopic = userOtherTopicFollower[indexUserOtherTopic];

        tempUsers.push({
          ...userTopic,
          viewtype: 'user'
        });
      }

      if (tempUsers.length > 0) {
        result.push({
          viewtype: 'labelothers',
          name: 'Other popular members',
          users_count: tempUsers.length,
          users: tempUsers
        });
      }
    }
    // OTHER USERS

    return res.status(200).json({
      status: 'success',
      code: 200,
      body: result,
      success: true
    });
  } catch (error) {
    return res.json({
      success: false,
      data: 0,
      message: error?.message
    });
  }
};
