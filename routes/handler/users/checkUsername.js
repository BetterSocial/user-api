const { User, sequelize } = require("../../../database/models");
module.exports = async (req, res) => {
  if (!req.body.username) {
    res.json({
      status: "error",
      code: 404,
      message: "username not found",
    });
  }
  const data = await User.count({
    where: sequelize.where(
      sequelize.fn("lower", sequelize.col("username")),
      sequelize.fn("lower", req.body.username)
    ),
  });
  res.json({
    status: "success",
    code: 200,
    body: data,
  });
};
