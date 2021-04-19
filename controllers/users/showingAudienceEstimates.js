// const { User, sequelize } = require("../../databases/models");
const { UserFollowUser, sequelize } = require("../../databases/models");
module.exports = async (req, res) => {
  try {
    let params = req.query;
    // let totalFollow = await UserFollowUser.count({
    //   where: {
    //     user_id_follower: "288d5679-6c68-41ec-be83-7f15a4e82d3d",
    //   },
    // });
    // console.log("follower ", totalFollow);
    console.log(params);
    let total_audience = 89;
    if (total_audience > 99) {
      return res.json({
        code: 200,
        status: "Success",
        data: total_audience,
      });
    } else {
      return res.json({
        code: 200,
        status: "Success",
        data: "Less than Hundreds(test)",
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
