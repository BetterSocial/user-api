const {
  UserFollowUser,
  UserFollowUserHistory,
} = require("../../databases/models");
const sequelize = require("../../databases/models").sequelize;
const Validator = require("fastest-validator");
const getstreamService = require("../../services/getstream");
const { v4: uuidv4 } = require("uuid");
const v = new Validator();
const moment = require("moment");
const { addForFollowUser } = require("../../services/score");

module.exports = async (req, res) => {
  try {
    const schema = {
      user_id_follower: "string|empty:false",
      user_id_followed: "string|empty:false",
      follow_source: "string|empty:false",
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: validate,
      });
    }
    let { user_id_follower, user_id_followed, follow_source } = req.body;

    if(user_id_follower == user_id_followed) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: "only allow following other profiles",
      });
    }

    const userFollow = await UserFollowUser.findOne({
      where: { user_id_follower, user_id_followed },
    });

    if (userFollow === null) {
      try {
        const result = await sequelize.transaction(async (t) => {
          let returnUserFollowUser = await UserFollowUser.create(
            {
              follow_action_id: uuidv4(),
              user_id_follower,
              user_id_followed,
            },
            { transaction: t }
          );

          await UserFollowUserHistory.create(
            {
              user_id_follower,
              user_id_followed,
              action: "in",
              source: follow_source.toLowerCase(),
            },
            { transaction: t }
          );

          return returnUserFollowUser;
        });

        if (result === null) {
          return res.status(409).json({
            code: 409,
            status: "error",
            message: "error create data",
          });
        } else {
          await getstreamService.followUserExclusive(user_id_follower, user_id_followed, 1);
          
          // sending queue for scoring process on follow user event
          const scoringProcessData = {
            user_id: user_id_follower,
            followed_user_id: user_id_followed,
            activity_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
          };
          await addForFollowUser(scoringProcessData);
      
          return res.status(201).json({
            status: "success",
            code: 200,
            data: result,
          });
        }
      } catch (error) {
        const { data } = error.response;
        return res.status(500).json({
          code: 500,
          status: "error",
          message: data,
        });
      }
    } else {
      return res.status(409).json({
        code: 409,
        status: "error",
        message: "The user has followed",
      });
    }
  } catch (error) {
    console.log("isi error ", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: error,
    });
  }
};
