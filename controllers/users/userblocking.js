const getstreamService = require("../../services/getstream");
const {
  UserFollowUser,
  UserFollowUserHistory,
  UserBlockedUser,
  UserBlockedUserHistory,
  sequelize,
} = require("../../databases/models");
const { v4: uuidv4 } = require("uuid");
const Validator = require("fastest-validator");
const v = new Validator();
module.exports = async (req, res) => {
  try {
    const schema = {
      userId: "string",
      postId: "string",
      reason: "array|optional:true",
      message: "string|optional:true",
      source: "string",
    };
    const validate = await v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: validate,
      });
    }

    const result = await sequelize.transaction(async (t) => {
      await UserFollowUser.destroy(
        {
          where: {
            user_id_follower: req.body.userId,
            user_id_followed: req.userId,
          },
        },
        { transaction: t }
      );
      const reason = {
        reason: req.body.reason ? req.body.reason : null,
        message: req.body.message ? req.body.message : null,
      };
      const userBlock = {
        blocked_action_id: uuidv4(),
        user_id_blocker: req.userId,
        user_id_blocked: req.body.userId,
        reason_blocked: reason,
      };
      let resultUserBlock = await UserBlockedUser.create(userBlock, {
        transaction: t,
      });

      // const userBlockHistory = {
      //   user_id_blocker: req.userId,
      //   user_id_blocked: req.body.userId,
      //   action: "out",
      //   source: req.body.source,
      // };
      // await UserBlockedUserHistory.create(userBlockHistory, { transaction: t });

      const history = {
        user_id_follower: req.body.userId,
        user_id_followed: req.userId,
        action: "out",
        source: `postId:${req.body.postId}`,
      };
      await UserFollowUserHistory.create(history, { transaction: t });
      return resultUserBlock;
    });

    await getstreamService.followUser.followUser(
      req.token,
      req.body.userId,
      "user",
      0
    );
    res.json({
      message: "The user has been successfully blocked",
      code: 200,
      data: result,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error,
      data: "",
      status: "error",
    });
  }
};
