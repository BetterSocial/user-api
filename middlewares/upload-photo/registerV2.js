const {USERS_DEFAULT_IMAGE} = require('../../helpers/constants');
const CloudinaryService = require('../../vendor/cloudinary');

const RegisterV2UploadPhotoMiddleware = async (req, res, next) => {
  /**
   * @type {RegisterBody}
   */
  const {data} = req.body;

  /**
   * @type {RegisterBodyData}
   */
  let newData = {...data};

  if (!data?.users?.profile_pic_path) {
    newData.users.profile_pic_path = USERS_DEFAULT_IMAGE;
    req.body.data = newData;
    return next();
  }

  try {
    let userPhoto = await CloudinaryService.uploadBase64(data?.users?.profile_pic_path);
    newData.users.profile_pic_path = userPhoto?.secure_url;
    newData.users.cloudinary = userPhoto;
    req.body.data = newData;

    next();
  } catch (error) {
    console.log('error uploading photo', error);
    return res.status(500).json({
      code: 500,
      status: 'error uploading photo',
      message: error
    });
  }
};

module.exports = RegisterV2UploadPhotoMiddleware;
