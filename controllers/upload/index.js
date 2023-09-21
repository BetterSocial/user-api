const UploadPhotoBase64Controller = require('./uploadPhotoBase64Controller');
const UploadPhotoController = require('./uploadPhotoController');

const UploadController = {
  uploadPhoto: UploadPhotoController,
  uploadPhotoBase64: UploadPhotoBase64Controller
};

module.exports = UploadController;
