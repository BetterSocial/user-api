const {
  User,
  UserFollowUser,
  UserLocation,
  Locations,
} = require("../../databases/models");
const checkMoreOrLess = require("../../helpers/checkMoreOrLess")
  .checkMoreOrLess;
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
        // {
        //   model: UserLocation,
        //   as: "user_locations",
        // },
        {
          model: Locations,
          as: "locations",
        },
      ],
    });
    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "User not found",
      });
    } else {
      let copyUser = { ...user.dataValues };
      delete copyUser.following;
      delete copyUser.follower;

      copyUser.following = user.dataValues.following.length;
      copyUser.following_symbol = checkMoreOrLess(
        user.dataValues.following.length
      );
      copyUser.follower = user.dataValues.follower.length;
      copyUser.follower_symbol = checkMoreOrLess(
        user.dataValues.follower.length
      );

      return res.json({
        status: "success",
        code: 200,
        data: copyUser,
      });
    }
  } catch (error) {
    // const { status, data } = error.response;
    return res.status(500).json({
      code: 500,
      status: "error",
      message: error,
    });
  }
};
