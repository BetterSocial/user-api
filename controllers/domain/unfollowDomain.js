const {
  UserFollowDomain,
  UserFollowDomainHistory,
  sequelize,
} = require("../../databases/models");
const { v4: uuidv4 } = require("uuid");
module.exports = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const follow = {
        user_id_follower: req.userId,
        domain_id_followed: req.body.domainId,
      };
      await UserFollowDomain.destroy(
        {
          where: follow,
        },
        { transaction: t }
      );

      const history = {
        follow_domain_history_id: uuidv4(),
        user_id_follower: req.userId,
        domain_id_followed: req.body.domainId,
        action: "out",
        source: req.body.source,
      };
      const resultHistory = await UserFollowDomainHistory.create(history, {
        transaction: t,
      });
      return resultHistory;
    });
    res.json({
      code: 200,
      status: "success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error,
    });
  }
};
