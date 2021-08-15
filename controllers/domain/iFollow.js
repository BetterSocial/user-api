const { UserFollowDomain } = require("../../databases/models");
module.exports = async (req, res) => {
  try {
    const result = await UserFollowDomain.findAll({
      attributes: ["user_id_follower", "domain_id_followed"],
      where: {
        user_id_follower: req.userId,
      },
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
