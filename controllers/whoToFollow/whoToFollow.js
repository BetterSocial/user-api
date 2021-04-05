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
    })

    let result = [{name: 'topic', data:TopicsData },{name: 'location', data:LocationsData }]

    return res.status(200).json({
      status: "success",
      code: 200,
      body: result,
    });
  } catch (error) {
    const { status, data } = error.response;
    return res.json({
      code: status,
      data: 0,
      message: data,
    });
  }
};
