const cloudinary = require('cloudinary').v2;
const fs = require('fs');

/**
 *
 * @param {String} path
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */
const upload = async (path) => {
  if (!path) throw new Error('path is required');
  return await cloudinary.uploader.upload(path, {
    overwrite: false,
    invalidate: true
  });
};

/**
 *
 * @param {String} base64
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */
const uploadBase64 = async (base64 = null) => {
  if (!base64) throw new Error('base64 is required');

  if (!base64.startsWith('data:image/jpeg;base64,')) {
    base64 = `data:image/jpeg;base64,${base64}`;
  }

  return await cloudinary.uploader.upload(base64, {
    overwrite: false,
    invalidate: true
  });
};

const uploadBase64Array = async (base64Array = []) => {
  if (!base64Array) throw new Error('base64Array is required');
  let cloudinaryLinkArray = [];

  for (const url of base64Array) {
    let returnCloudinary = await CloudinaryService.uploadBase64(url);
    cloudinaryLinkArray.push(returnCloudinary?.secure_url);
  }

  return cloudinaryLinkArray;
};

const CloudinaryService = {
  upload,
  uploadBase64,
  uploadBase64Array
};

module.exports = CloudinaryService;
