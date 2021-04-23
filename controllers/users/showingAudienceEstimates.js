const {
  UserFollowUser,
  UserLocation,
  sequelize,
} = require("../../databases/models");
module.exports = async (req, res) => {
  try {
    let userCount = 0;
    let params = req.query;
    let userId = req.userId;

    if (params.privacy.toLowerCase() == "public") {
      if (params.location.toLowerCase() == "everywhere") {
        userCount = await UserLocation.count();
      } else {
        userCount = await UserLocation.count({
          where: {
            location_id: params.location,
          },
        });
      }
    } else {
      if (params.location.toLowerCase() == "everywhere") {
        userCount = await UserFollowUser.count({
          where: {
            user_id_followed: userId,
          },
        });
      } else {
        let resultData = await sequelize.query(
          `SELECT COUNT(*) FROM user_follow_user INNER JOIN user_location on user_follow_user.user_id_follower = user_location.user_id WHERE user_follow_user.user_id_followed='${userId}' AND user_location.location_id=${params.location}`
        );
        userCount = resultData[0][0].count;
      }
    }
    if (userCount > 99) {
      return res.json({
        code: 200,
        status: "Success",
        data: userCount,
      });
    } else {
      return res.json({
        code: 200,
        status: "Success",
        data: "Less than Hundreds",
      });
    }
  } catch (error) {
    return res.json({
      code: 500,
      status: "Error",
      data: 0,
      message: error.message,
    });
  }
};
