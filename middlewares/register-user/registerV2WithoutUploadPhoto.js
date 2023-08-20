const {USERS_DEFAULT_IMAGE} = require('../../helpers/constants');

const RegisterV2WithoutUploadPhotoMiddleware = async (req, res, next) => {
  /**
   * @type {RegisterBody}
   */
  const {data} = req.body;

  /**
   * @type {RegisterBodyData}
   */
  const newData = {...data};

  if (!data?.users?.profile_pic_path) {
    newData.users.profile_pic_path = USERS_DEFAULT_IMAGE;
    req.body.data = newData;
  }

  return next();
};

module.exports = RegisterV2WithoutUploadPhotoMiddleware;
