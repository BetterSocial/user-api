/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const Validator = require('fastest-validator');
const {Op} = require('sequelize');
const {Topics, Locations, sequelize} = require('../../databases/models');

const v = new Validator();

module.exports = async (req, res) => {
  const schema = {
    topics: 'string[]|empty:false',
    locations: 'string[]|empty:false'
  };

  let topics, locations;
  try {
    topics = JSON.parse(decodeURI(req.query.topics || []));
    locations = JSON.parse(decodeURI(req.query.locations || []));
  } catch (e) {
    return res.status(403).json({
      code: 403,
      status: 'error',
      message: 'Invalid query'
    });
  }

  const validate = v.validate({topics, locations}, schema);
  if (validate.length) {
    return res.status(403).json({
      code: 403,
      status: 'error',
      message: validate
    });
  }

  try {
    const topicsQuery = `SELECT * FROM vwm_user_topic_follower_count_rank WHERE topic_id IN (:topics) AND topic_follower_rank <= 10 ORDER BY topic_follower_rank ASC, CASE WHEN profile_pic_path != '%default-profile-picture%' THEN 0 ELSE 1 END`;

    const locationQuery = `SELECT * FROM vwm_user_location_follower_count WHERE location_id IN (:locations) AND follower_rank <= 10 ORDER BY follower_rank ASC, CASE WHEN profile_pic_path != '%default-profile-picture%' THEN 0 ELSE 1 END`;

    const otherTopicsQuery = `SELECT * FROM vwm_user_topic_follower_count_rank WHERE topic_id NOT IN (:topics) AND topic_follower_rank <= 10 ORDER BY follower_count DESC, CASE WHEN profile_pic_path != '%default-profile-picture%' THEN 0 ELSE 1 END LIMIT 35`;

    const userTopicFollowerQueryResult = await sequelize.query(topicsQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        topics
      }
    });
    const userTopicFollower = userTopicFollowerQueryResult;

    const userLocationFollowerQueryResult = await sequelize.query(locationQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        locations
      }
    });
    const userLocationFollower = userLocationFollowerQueryResult;

    const userOtherTopicFollowerQueryResult = await sequelize.query(otherTopicsQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        topics
      }
    });
    const userOtherTopicFollower = userOtherTopicFollowerQueryResult;

    const TopicsData = await Topics.findAll({
      where: {
        topic_id: topics,
        deleted_at: null,
        sign: true,
        sort: {
          [Op.and]: {
            [Op.not]: null,
            [Op.not]: 0
          }
        }
      },
      raw: true,
      order: [['sort', 'ASC']]
    });

    const LocationsData = await Locations.findAll({
      where: {location_id: locations},
      raw: true
    });

    const result = [];
    for (const indexTopic in TopicsData) {
      const tempUsers = [];
      const topic = TopicsData[indexTopic];

      for (const indexUserTopic in userTopicFollower) {
        const userTopic = userTopicFollower[indexUserTopic];
        delete userTopic.human_id;
        if (
          userTopic.topic_id === topic.topic_id &&
          userTopic.user_id !== process.env.BETTER_ADMIN_ID
        ) {
          tempUsers.push({
            ...userTopic,
            viewtype: 'user'
          });
        }
      }

      if (tempUsers.length > 0) {
        result.push({
          viewtype: 'labeltopic',
          name: topic.name,
          id: topic.topic_id,
          users: tempUsers
        });
      }
    }

    for (const indexLocation in LocationsData) {
      const tempUsers = [];
      const location = LocationsData[indexLocation];

      for (const indexUserLocation in userLocationFollower) {
        const userLocation = userLocationFollower[indexUserLocation];
        delete userLocation.human_id;
        if (userLocation.location_id === location.location_id)
          tempUsers.push({
            ...userLocation,
            viewtype: 'user'
          });
      }

      if (tempUsers.length > 0) {
        result.push({
          ...location,
          viewtype: 'labellocation',
          users: tempUsers
        });
      }
    }

    //Other topics
    const tempUsers = [];
    for (const indexUserOtherTopic in userOtherTopicFollower) {
      const userOtherTopic = userOtherTopicFollower[indexUserOtherTopic];
      delete userOtherTopic.human_id;
      if (userOtherTopic.user_id !== process.env.BETTER_ADMIN_ID) {
        tempUsers.push({
          ...userOtherTopic,
          viewtype: 'user'
        });
      }
    }

    if (tempUsers.length > 0) {
      result.push({
        viewtype: 'labelothers',
        name: 'Other popular members',
        users: tempUsers
      });
    }
    //ENN other topics

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
