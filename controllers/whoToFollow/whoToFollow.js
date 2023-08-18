/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const Validator = require('fastest-validator');
const {Topics, Locations, sequelize} = require('../../databases/models');

const v = new Validator();

module.exports = async (req, res) => {
  const schema = {
    topics: 'string[]|empty:false',
    locations: 'string[]|empty:false'
  };

  const topics = JSON.parse(decodeURI(req.query.topics || []));
  const locations = JSON.parse(decodeURI(req.query.locations || []));

  const validate = v.validate({topics, locations}, schema);
  if (validate.length) {
    return res.status(403).json({
      code: 403,
      status: 'error',
      message: validate
    });
  }

  try {
    const topicsQuery = `SELECT * FROM vwm_user_topic_follower_count_rank WHERE topic_id IN (:topics) AND topic_follower_rank <= 10 order BY topic_follower_rank ASC`;

    const locationQuery = `SELECT * FROM vwm_user_location_follower_count WHERE location_id IN (:locations) AND follower_rank <= 10 order BY follower_rank ASC`;

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

    const TopicsData = await Topics.findAll({
      where: {topic_id: topics},
      raw: true
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
        if (tempUsers?.length >= 10) break;
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

      result.push({
        viewtype: 'labeltopic',
        name: topic.name,
        id: topic.topic_id
      });

      if (tempUsers.length > 0) {
        result.push(...tempUsers);
      }
    }
    for (const indexLocation in LocationsData) {
      const tempUsers = [];
      const location = LocationsData[indexLocation];

      for (const indexUserLocation in userLocationFollower) {
        const userLocation = userLocationFollower[indexUserLocation];
        delete userLocation.human_id;
        if (userLocation.location_id === location.location_id && tempUsers?.length < 10)
          tempUsers.push({
            ...userLocation,
            viewtype: 'user'
          });
      }

      if (tempUsers.length > 0) {
        result.push({
          ...location,
          viewtype: 'labellocation'
        });

        result.push(...tempUsers);
      }
    }

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
