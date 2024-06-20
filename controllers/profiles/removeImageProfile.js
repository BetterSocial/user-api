const {User} = require('../../databases/models');
const moment = require('moment');
const updateUser = require('../../services/getstream/updateUser');
const {USERS_DEFAULT_IMAGE} = require('../../helpers/constants');

module.exports = async (req, res) => {
  try {
    let defaultImage = USERS_DEFAULT_IMAGE;
    const user = await User.findOne({
      where: {
        user_id: req.userId
      }
    });
    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'User not found'
      });
    } else {
      let myTs = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

      await updateUser(req?.userId, {
        username: user.username,
        profile_pic_url: defaultImage,
        profileImage: defaultImage,
        image: defaultImage
      });

      const [_numberOfAffectedRows, affectedRows] = await User.update(
        {
          profile_pic_path: defaultImage,
          updated_at: myTs
        },
        {
          where: {user_id: req?.userId},
          returning: true, // needed for affectedRows to be populated
          plain: true // makes sure that the returned instances are just plain objects
        }
      );
      if (affectedRows !== null || affectedRows !== undefined) {
        return res.json({
          status: 'success',
          code: 200,
          data: affectedRows
        });
      }
    }
  } catch (error) {
    const {status, data} = error.response;
    return res.status(500).json({
      code: status,
      status: 'error',
      message: data
    });
  }
};
