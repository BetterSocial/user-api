const fs = require('fs');

const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');
const CloudinaryService = require('../../vendor/cloudinary');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const UploadPhotoController = async (req, res) => {
  try {
    const file = req?.file?.path;
    const {secure_url} = await CloudinaryService.upload(file);
    fs.unlinkSync(file);
    return SuccessResponse(res, {url: secure_url}, 'Upload photo success');
  } catch (e) {
    return ErrorResponse.e400(res, e?.message || 'Upload photo failed');
  }
};

module.exports = UploadPhotoController;
