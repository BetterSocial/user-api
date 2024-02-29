const {User} = require('../../databases/models');

module.exports = async (req, res) => {
  let {userId} = req.params;
  let user = await User.findOne({where: {user_id: userId, is_anonymous: false}});

  if (user) {
    return res.status(200).json({
      status: 'success',
      user: {
        id: user.user_id,
        allow_anon_dm: user.allow_anon_dm
      }
    });
  } else {
    return res.status(400).json({
      status: 'error',
      message: 'User Not Found'
    });
  }
};
