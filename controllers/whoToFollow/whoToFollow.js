// const { User, } = require("../../databases/models");
// module.exports = async (req, res) => {
//   try {
//     return User.findAll({})
//       .then((list) => {
//         let result = [
//           {
//             group_name: "General",
//             data: list,
//           },
//         ];
//         res.status(200).json({
//           status: "success",
//           code: 200,
//           body: result,
//         });
//       })
//       .catch((error) => res.status(400).json(error));
//   } catch (error) {
//     const { status, data } = error.response;
//     return res.json({
//       code: status,
//       data: 0,
//       message: data,
//     });
//   }
// };

const { Topics, Locations, User } = require("../../databases/models");
const { Op } = require("sequelize");
const _ = require('lodash');

module.exports = async (req, res) => {
  try {
    let tempData = []
    let TopicsData = []
    let LocationsData = []

    TopicsData = await Topics.findAll({
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
      plain: true,
    })

    let result = []
    _.forEach(TopicsData, (value, index) => {
      if(value.users){
        result.push({
          viewtype: 'label',
          name : value.name,
          id: value.id,
        });

        value.users.map((user, idx) => {
          result.push({
            viewtype: 'user',
            user_id : user.user_id,
            human_id : user.human_id,
            username: user.username,
            real_name: user.real_name,
            profile_pic_path: user.profile_pic_path,
            bio: user.bio,
          })
        })
      }
    })

    _.forEach(LocationsData, (value, index) => {
      if(value.users) {
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

        value.users.map((user, idx) => {
          result.push({
            viewtype: 'user',
            user_id : user.user_id,
            human_id : user.human_id,
            username: user.username,
            real_name: user.real_name,
            profile_pic_path: user.profile_pic_path,
            bio: user.bio,
          })
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
