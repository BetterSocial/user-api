const { Topics, Locations, User } = require("../../databases/models");
const { Op } = require("sequelize");
const _ = require('lodash');
const Validator = require('fastest-validator');
const v = new Validator();

const MAX_ITEM_PER_GROUP = 5;

module.exports = async (req, res) => {
  const schema = {
    topics : "string[]|empty:false",
    locations: "string[]|empty:false"
  };

  let topics = JSON.parse(decodeURI(req.query.topics))
  let locations = JSON.parse(decodeURI(req.query.locations))

  const validate = v.validate({topics, locations}, schema);
  if(validate.length) {
    return res.status(403).json({
      code: 403,
      status: "error",
      message: validate,
    });
  }

  try {
    let tempData = []
    let TopicsData = []
    let LocationsData = []

    TopicsData = await Topics.findAll({
      where : {'topic_id' : topics},
      include: [
        {
          model: User,
          as: "users",
          where: {
            profile_pic_path: {
              [Op.ne]: null
            }
          }
        },
      ],
    })

    LocationsData = await Locations.findAll({
      where : {'location_id' : locations},
      include: [
        {
          model: User,
          as: "users",
          where: {
            profile_pic_path: {
              [Op.ne]: null
            }
          }
        },
      ],
    })

    let result = []
    let duplicateUserChecker = [];


    _.forEach(TopicsData, (value, index) => {
      let isTopicAdded = false;
      if(value.users){
        let userToBeReturned = 0
        value.users.map((user, idx) => {
          if(duplicateUserChecker.includes(user.user_id) || userToBeReturned >= MAX_ITEM_PER_GROUP) return
          else {
            if(!isTopicAdded) {
              isTopicAdded = true; 
              result.push({
                viewtype: 'label',
                name : value.name,
                id: value.topic_id,
              });
            } 
            duplicateUserChecker.push(user.user_id);
            userToBeReturned++;
            result.push({
              viewtype: 'user',
              user_id : user.user_id,
              human_id : user.human_id,
              username: user.username,
              real_name: user.real_name,
              profile_pic_path: user.profile_pic_path,
              bio: user.bio,
            })           
          }
        })
      }
    })

    _.forEach(LocationsData, (value, index) => {
      let isLocationsAdded = false;
      if(value.users) {
        let userToBeReturned = 0
        value.users.map((user, idx) => {
          if(duplicateUserChecker.includes(user.user_id) || userToBeReturned >= MAX_ITEM_PER_GROUP) return
          else {
            if(!isLocationsAdded) {
              isLocationsAdded = true;
              result.push({
                viewtype: 'label',
                name : value.city,
                location_id: value.location_id,
                zip: value.zip,
                neighborhood: value.neighborhood,
                city: value.city,
                state: value.state,
                country: value.country,
                location_level: value.location_level,
                status: value.status,
                slug_name: value.slug_name,
              });
            }
            duplicateUserChecker.push(user.user_id);
            userToBeReturned++;
            
            result.push({
              viewtype: 'user',
              user_id : user.user_id,
              human_id : user.human_id,
              username: user.username,
              real_name: user.real_name,
              profile_pic_path: user.profile_pic_path,
              bio: user.bio,
            })
          }
        })
      }
    })

    console.log('Who to follow size')
    console.log(result.length)

    return res.status(200).json({
      status: "success",
      code: 200,
      body: result,
    });
  } catch (error) {
    console.log(error)
    // const { status, data } = error.response;
    // return res.json({
    //   code: status,
    //   data: 0,
    //   message: data,
    // });
  }
};
