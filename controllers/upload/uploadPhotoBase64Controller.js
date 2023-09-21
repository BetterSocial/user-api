const ErrorResponse = require('../../utils/response/ErrorResponse');
const SuccessResponse = require('../../utils/response/SuccessResponse');
const CloudinaryService = require('../../vendor/cloudinary');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const UploadPhotoBase64Controller = async (req, res) => {
  try {
    const {photo} = req?.body || {};
    const {secure_url} = await CloudinaryService.uploadBase64(photo);
    return SuccessResponse(res, {url: secure_url}, 'Upload photo success');
  } catch (e) {
    return ErrorResponse.e400(res.e?.message || 'Upload photo failed');
  }
};

module.exports = UploadPhotoBase64Controller;
