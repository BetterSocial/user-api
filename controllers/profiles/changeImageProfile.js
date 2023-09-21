const {User} = require('../../databases/models');
const cloudinary = require('cloudinary');
const Validator = require('fastest-validator');
const moment = require('moment');
const updateUser = require('../../services/getstream/updateUser');
const CloudinaryService = require('../../vendor/cloudinary');
const v = new Validator();

module.exports = async (req, res) => {
  try {
    let {profile_pic_path} = req.body;

    const user = req.userModel;

    let returnCloudinary = await CloudinaryService.uploadBase64(profile_pic_path);
    if (returnCloudinary) {
      let myTs = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      updateUser(req?.userId, {
        username: user.username,
        profile_pic_url: returnCloudinary.secure_url
      });
      const [, affectedRows] = await User.update(
        {
          profile_pic_path: returnCloudinary.secure_url ? returnCloudinary.secure_url : null,
          profile_pic_asset_id: returnCloudinary.asset_id ? returnCloudinary.asset_id : null,
          profile_pic_public_id: returnCloudinary.public_id ? returnCloudinary.public_id : null,
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
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error
    });
  }
};
