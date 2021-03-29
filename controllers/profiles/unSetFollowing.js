const {
  UserFollowUser,
  UserFollowUserHistory,
} = require("../../databases/models");
const sequelize = require("../../databases/models").sequelize;
const Validator = require("fastest-validator");
const { v4: uuidv4 } = require("uuid");
const v = new Validator();

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

    const userFollow = await UserFollowUser.findOne({
      where: { user_id_follower, user_id_followed },
    });

    if (userFollow === null) {
      return res.status(409).json({
        code: 409,
        status: "error",
        message: "The user not followed",
      });
    } else {
      try {
        const result = await sequelize.transaction(async (t) => {
          let returnUserFollowUser = await UserFollowUser.destroy(
            {
              where: {
                follow_action_id: userFollow.dataValues.follow_action_id,
              },
            },
            { transaction: t, returning: true }
          );

          await UserFollowUserHistory.create(
            {
              user_id_follower,
              user_id_followed,
              action: "out",
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
