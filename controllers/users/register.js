const {
  User,
  UserLocation,
  UserLocationHistory,
  UserTopic,
  UserTopicHistory,
  UserFollowUser,
  UserFollowUserHistory,
} = require("../../databases/models");
const sequelize = require("../../databases/models").sequelize;
const cloudinary = require("cloudinary");
const { v4: uuidv4 } = require("uuid");
const Validator = require("fastest-validator");
const moment = require("moment");
const v = new Validator();
module.exports = async (req, res) => {
  const schema = {
    users: {
      $$type: "object|empty:false",
      username: "string|empty:false",
      human_id: "string|empty:false",
      country_code: "string|empty:false",
      real_name: "string|optional: true",
      profile_pic_path: "string|base64|optional: true",
    },
    local_community: "string[]",
    topics: "string[]|empty:false",
    follows: "string[]|empty:false",
    follow_source: "string|empty:false",
  };
  let {
    users,
    local_community,
    topics,
    follows,
    follow_source,
  } = req.body.data;
  const validate = v.validate(req.body.data, schema);
  if (validate.length) {
    return res.status(200).json({
      code: 404,
      status: "error",
      message: validate,
    });
  }

  if (users.profile_pic_path) {
    const uploadStr = "data:image/jpeg;base64," + users.profile_pic_path;
    let returnCloudinary = await cloudinary.v2.uploader.upload(uploadStr, {
      overwrite: false,
      invalidate: true,
    });

    if (returnCloudinary.asset_id.length > 0) {
      try {
        const result = await sequelize.transaction(async (t) => {
          let myTs = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
          const user = await User.create(
            {
              //   generate UUID
              user_id: uuidv4(),
              human_id: users.human_id,
              country_code: users.country_code,
              username: users.username,
              real_name: users.real_name,
              profile_pic_path: returnCloudinary.url,
              profile_pic_asset_id: returnCloudinary.asset_id,
              profile_pic_public_id: returnCloudinary.public_id,
              created_at: myTs,
              updated_at: myTs,
              last_active_at: myTs,
              status: "A",
            },
            { transaction: t }
          );

          // local Comunity
          let local_community_array_return = local_community.map(
            (val, index) => {
              return {
                //   generate UUID
                // user_location_id: uuidv4(),
                // user_location_id: val,
                user_id: user.user_id,
                location_id: val,
                created_at: myTs,
                updated_at: myTs,
              };
            }
          );
          let returnUserLocation = await UserLocation.bulkCreate(
            local_community_array_return,
            { transaction: t, returning: true }
          );

          if (returnUserLocation.length > 0) {
            let user_location_return = returnUserLocation.map((val) => {
              return {
                //   generate UUID
                // user_location_id: uuidv4(),
                // user_location_id: val.location_id,
                user_id: val.user_id,
                location_id: val.location_id,
                action: "in",
                created_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
              };
            });
            await UserLocationHistory.bulkCreate(user_location_return, {
              transaction: t,
            });
          }

          // Topics
          let topics_array_return = topics.map((val) => {
            return {
              //   generate UUID
              user_topics_id: uuidv4(),
              user_id: user.user_id,
              topic_id: val,
              created_at: myTs,
              updated_at: myTs,
            };
          });
          let returnTopic = await UserTopic.bulkCreate(topics_array_return, {
            transaction: t,
            returning: true,
          });

          if (returnTopic.length > 0) {
            let topic_return = returnTopic.map((val) => {
              return {
                user_id: val.user_id,
                topic_id: val.topic_id,
                action: "in",
                created_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
              };
            });
            await UserTopicHistory.bulkCreate(topic_return, {
              transaction: t,
            });
          }

          // User Follow User
          let follows_array_return = follows.map((val) => {
            return {
              //   generate UUID
              follow_action_id: uuidv4(),
              user_id_follower: user.user_id,
              user_id_followed: val,
            };
          });

          let returnUserFollowUser = await UserFollowUser.bulkCreate(
            follows_array_return,
            {
              transaction: t,
              returning: true,
            }
          );

          if (returnUserFollowUser.length > 0) {
            let user_follow_user_return = returnUserFollowUser.map((val) => {
              return {
                user_id_follower: val.user_id_follower,
                user_id_followed: val.user_id_followed,
                action: "in",
                source: follow_source,
              };
            });
            await UserFollowUserHistory.bulkCreate(user_follow_user_return, {
              transaction: t,
            });
          }

          return user;
        });
        return res.status(201).json({
          status: "success",
          code: 200,
          body: result,
        });
      } catch (error) {
        console.log("isi err ", error);
        return res.status(500).json({
          status: "error",
          code: 500,
          message: error,
        });
      }
    } else {
      return res.status(500).json({
        status: "error",
        code: 500,
        message: error,
      });
    }
  }
};

// try {
//   const result = await sequelize.transaction(async (t) => {
//     let myTs = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
//     const user = await User.create(
//       {
//         //   generate UUID
//         user_id: uuidv4(),
//         human_id: users.human_id,
//         country_code: users.country_code,
//         username: users.username,
//         real_name: users.real_name,
//         profile_pic_path: res.url,
//         profile_pic_asset_id: res.asset_id,
//         profile_pic_public_id: res.public_id,
//         created_at: myTs,
//         updated_at: myTs,
//         last_active_at: myTs,
//         status: "A",
//       },
//       { transaction: t }
//     );

//     // local Comunity
//     let local_community_array_return = local_community.map(
//       (val, index) => {
//         return {
//           //   generate UUID
//           // user_location_id: uuidv4(),
//           // user_location_id: val,
//           user_id: user.user_id,
//           location_id: val,
//           created_at: myTs,
//           updated_at: myTs,
//         };
//       }
//     );
//     let returnUserLocation = await UserLocation.bulkCreate(
//       local_community_array_return,
//       { transaction: t, returning: true }
//     );

//     if (returnUserLocation.length > 0) {
//       let user_location_return = returnUserLocation.map((val) => {
//         return {
//           //   generate UUID
//           // user_location_id: uuidv4(),
//           // user_location_id: val.location_id,
//           user_id: val.user_id,
//           location_id: val.location_id,
//           action: "in",
//           created_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
//         };
//       });
//       await UserLocationHistory.bulkCreate(user_location_return, {
//         transaction: t,
//       });
//     }

//     // Topics
//     let topics_array_return = topics.map((val) => {
//       return {
//         //   generate UUID
//         user_topics_id: uuidv4(),
//         user_id: user.user_id,
//         topic_id: val,
//         created_at: myTs,
//         updated_at: myTs,
//       };
//     });
//     let returnTopic = await UserTopic.bulkCreate(topics_array_return, {
//       transaction: t,
//       returning: true,
//     });

//     if (returnTopic.length > 0) {
//       let topic_return = returnTopic.map((val) => {
//         return {
//           user_id: val.user_id,
//           topic_id: val.topic_id,
//           action: "in",
//           created_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
//         };
//       });
//       await UserTopicHistory.bulkCreate(topic_return, {
//         transaction: t,
//       });
//     }

//     // User Follow User
//     let follows_array_return = follows.map((val) => {
//       return {
//         //   generate UUID
//         follow_action_id: uuidv4(),
//         user_id_follower: user.user_id,
//         user_id_followed: val,
//       };
//     });

//     let returnUserFollowUser = await UserFollowUser.bulkCreate(
//       follows_array_return,
//       {
//         transaction: t,
//         returning: true,
//       }
//     );

//     if (returnUserFollowUser.length > 0) {
//       let user_follow_user_return = returnUserFollowUser.map((val) => {
//         return {
//           user_id_follower: val.user_id_follower,
//           user_id_followed: val.user_id_followed,
//           action: "in",
//           source: follow_source,
//         };
//       });
//       await UserFollowUserHistory.bulkCreate(user_follow_user_return, {
//         transaction: t,
//       });
//     }

//     return user;
//   });
//   return res.status(201).json({
//     status: "success",
//     code: 200,
//     body: result,
//   });
// } catch (error) {
//   console.log("isi err ", error);
// }
