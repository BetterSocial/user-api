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
const { delCache } = require("../../services/redis");
const { BLOCK_FEED_KEY } = require("../../helpers/constants");
const { getIdBlockFeed } = require("../../utils/block");
const { addForBlockUser } = require("../../services/score");
const v = new Validator();
const moment = require("moment");
const QueueTrigger = require("../../services/queue/trigger");

module.exports = async (req, res) => {
  try {
    const schema = {
      userId: "string",
      postId: "string|optional:true",
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
        post_id:req.body.postId
      };
      let resultUserBlock = await UserBlockedUser.create(userBlock, {
        transaction: t,
      });

      const userBlockHistory = {
        user_blocked_user_history_id: uuidv4(),
        user_id_blocker: req.userId,
        user_id_blocked: req.body.userId,
        action: "out",
        source: req.body.source,
      };
      await UserBlockedUserHistory.create(userBlockHistory, { transaction: t });

      const history = {
        user_id_follower: req.body.userId,
        user_id_followed: req.userId,
        action: "out",
        source: `postId:${req.body.postId}`,
      };
      await UserFollowUserHistory.create(history, { transaction: t });
      return resultUserBlock;
    });

    const key = getIdBlockFeed(req.userId);
    delCache(key);

    await getstreamService.followUserExclusive(req.userId, req.body.userId, 0);
    
    const scoringProcessData = {
      user_id: req.userId,
      feed_id: req.body.postId,
      blocked_user_id: req.body.userId,
      activity_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
    };
    await addForBlockUser(scoringProcessData);

    QueueTrigger.deleteCommentByBlock({
      authorUserId: req?.userId,
      commenterUserId: req?.body?.userId
    })

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
