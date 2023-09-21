const {responseError, responseSuccess} = require('../../utils/Responses');
const {UserFollowUser, User} = require('../../databases/models');
const {Op} = require('sequelize');

module.exports = async (req, res) => {
  try {
    let idUsers = [];
    let usersFollower = await UserFollowUser.findAll({
      where: {
        [Op.or]: [{user_id_follower: req.userId}, {user_id_followed: req.userId}]
      }
      //   attributes: ['user_id_follower'],
    });
    idUsers = usersFollower.map((item) => {
      if (item.user_id_follower !== req.userId) {
        return item.user_id_follower;
      }
      if (item.user_id_followed !== req.userId) {
        return item.user_id_followed;
      }
    });
    let users = await User.findAll({
      where: {
        user_id: idUsers,
        is_anonymous: false
      }
    });
    res.status(200).json(responseSuccess('Success get populate', users));
    // ambil user yang memfollow kita
  } catch (error) {
    console.log(error);
    res.status(500).json(responseError('Internal server error', null, 500));
  }
};
