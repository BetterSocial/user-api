const { User } = require("../../databases/models");
const cloudinary = require("cloudinary");
const Validator = require("fastest-validator");
const moment = require("moment");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      profile_pic_path: "string|stringBase64|empty:false",
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: validate,
      });
    }
    let { profile_pic_path } = req.body;

    const user = await User.findByPk(req.params.id);
    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "user not found",
      });
    }
    if (user && profile_pic_path) {
      try {
        const uploadStr = profile_pic_path;
        returnCloudinary = await cloudinary.v2.uploader.upload(uploadStr, {
          overwrite: false,
          invalidate: true,
        });
        if (returnCloudinary) {
          let myTs = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
          const [numberOfAffectedRows, affectedRows] = await User.update(
            {
              profile_pic_path: returnCloudinary.url
                ? returnCloudinary.url
                : null,
              profile_pic_asset_id: returnCloudinary.asset_id
                ? returnCloudinary.asset_id
                : null,
              profile_pic_public_id: returnCloudinary.public_id
                ? returnCloudinary.public_id
                : null,
              updated_at: myTs,
            },
            {
              where: { user_id: req.params.id },
              returning: true, // needed for affectedRows to be populated
              plain: true, // makes sure that the returned instances are just plain objects
            }
          );
          if (affectedRows !== null || affectedRows !== undefined) {
            return res.json({
              status: "success",
              code: 200,
              data: affectedRows,
            });
          }
        }
      } catch (error) {
        return res.status(500).json({
          code: 500,
          status: "error",
          message: error,
        });
      }
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
