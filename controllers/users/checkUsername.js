const {User, sequelize} = require('../../databases/models');
module.exports = async (req, res) => {
  if (!req.body.username) {
    res.json({
      code: 404,
      message: 'username not found',
      data: ''
    });
  }
  const data = await User.count({
    where: sequelize.where(
      sequelize.fn('lower', sequelize.col('username')),
      sequelize.fn('lower', req.body.username)
    )
  });
  res.json({
    message: 'success',
    code: 200,
    data: data
  });
};
