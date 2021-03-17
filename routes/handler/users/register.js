const { User } = require("../../../database/models");
const cloudinary = require("cloudinary");
const Validator = require("fastest-validator");
const v = new Validator();
module.exports = async (req, res) => {
  const schema = {
    username: "string|empty:false",
    profile_pic_path: "string|base64|optional: true",
  };
  let user = {};
  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(400).json({
      status: "error",
      message: validate,
    });
  }
  user.username = res.body.username;
  if (req.body.profile_pic_path) {
    const uploadStr = "data:image/jpeg;base64," + req.body.profile_pic_path;
    await cloudinary.v2.uploader
      .upload(uploadStr, {
        overwrite: false,
        invalidate: true,
      })
      .then((res) => {
        user.profile_pic_path = res.url;
        user.profile_pic_asset_id = res.asset_id;
        user.profile_pic_public_id = res.public_id;
      })
      .catch((error) => {
        return res.code(500).json({
          status: "error",
          message: error,
        });
      });
  }
  return res.json(user);
};
