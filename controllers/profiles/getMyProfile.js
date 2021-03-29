const { User, UserFollowUser } = require("../../databases/models");
module.exports = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: UserFollowUser,
          as: "following",
        },
        {
          model: UserFollowUser,
          as: "follower",
        },
      ],
    });
    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "user not found",
      });
    } else {
      let copyUser = { ...user.dataValues };
      delete copyUser.following;
      delete copyUser.follower;

      copyUser.following = user.dataValues.following.length;
      copyUser.follower = user.dataValues.follower.length;

      return res.json({
        status: "success",
        code: 200,
        data: copyUser,
      });
    }
  } catch (error) {
    const { status, data } = error.response;
    return res.status(500).json({
      code: status,
      status: "error",
      message: data,
    });
  }
};
