const { UserFollowDomain } = require("../../databases/models");
module.exports = async (req, res) => {
  try {
    const result = await UserFollowDomain.findAll({
      attributes: ["user_id_follower", "domain_id_followed"],
      where: {
        user_id_follower: req.userId,
      },
    });
    return res.json(result);
  } catch (error) {
    return res.json(error);
  }
};
