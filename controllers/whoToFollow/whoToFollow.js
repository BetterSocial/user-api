const { Topics, Locations, User, sequelize } = require("../../databases/models");
const { Op } = require("sequelize");
const _ = require('lodash');
const Validator = require('fastest-validator');
const v = new Validator();

const MAX_ITEM_PER_GROUP = 5;

module.exports = async (req, res) => {
  const schema = {
    topics: "string[]|empty:false",
    locations: "string[]|empty:false"
  };

  let topics = JSON.parse(decodeURI(req.query.topics || []))
  let locations = JSON.parse(decodeURI(req.query.locations || []))

  const validate = v.validate({ topics, locations }, schema);
  if (validate.length) {
    return res.status(403).json({
      code: 403,
      status: "error",
      message: validate,
    });
  }

  try {
    let topicsQuery = `SELECT * FROM vwm_user_topic_follower_count_rank WHERE topic_id IN (:topics)`

    let locationQuery = `SELECT * FROM vwm_user_location_follower_count WHERE location_id IN (:locations)`

    let userTopicFollowerQueryResult = await sequelize.query(topicsQuery, { 
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        // topics: topics.join(','),
        topics: topics
      }
    })
    let userTopicFollower = userTopicFollowerQueryResult

    let userLocationFollowerQueryResult = await sequelize.query(locationQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        // locations: locations.join(','),
        locations: locations
      }
    })
    let userLocationFollower = userLocationFollowerQueryResult
    
    let TopicsData = await Topics.findAll({
      where: { 'topic_id': topics },
      raw: true,
    })

    let LocationsData = await Locations.findAll({
      where: { 'location_id': locations },
      raw: true
    })

    let result = []
    // let duplicateUserChecker = [];

    for (let indexTopic in TopicsData) {
      let tempUsers = []
      let topic = TopicsData[indexTopic]

      for (let indexUserTopic in userTopicFollower) {
        let userTopic = userTopicFollower[indexUserTopic]
        if (userTopic.topic_id === topic.topic_id) tempUsers.push({
          ...userTopic,
          viewtype: 'user'
        })
      }

      if (tempUsers.length > 0) {
        result.push({
          viewtype: 'labeltopic',
          name: topic.name,
          id: topic.topic_id,
        })

        result.push(...tempUsers)
      }
    }

    for (let indexLocation in LocationsData) {
      let tempUsers = []
      let location = LocationsData[indexLocation]

      for (let indexUserLocation in userLocationFollower) {
        let userLocation = userLocationFollower[indexUserLocation]
        if (userLocation.location_id === location.location_id) tempUsers.push({
          ...userLocation,
          viewtype: 'user'
        })
      }

      if (tempUsers.length > 0) {
        result.push({
          ...location,
          viewtype: 'labellocation',
        })

        result.push(...tempUsers)
      }
    }

    const betterAccount = await User.findOne({
      where: {
        user_id: process.env.BETTER_ADMIN_ID
      }
    })
    result.push(betterAccount)
    result = _.uniqBy(result, 'user_id')
    return res.status(200).json({
      status: "success",
      code: 200,
      body: result,
      success: true,
    });
  } catch (error) {
    // const { status, data } = error.response;
    return res.json({
      status: failed,
      success: false,
      data: 0,
      message: data,
    });
  }
};
