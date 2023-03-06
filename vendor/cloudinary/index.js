const cloudinary = require('cloudinary').v2

/**
 * 
 * @param {String} base64 
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */
const uploadBase64 = async (base64 = null) => {
    if (!base64) throw new Error('base64 is required');
    const uploadStr = "data:image/jpeg;base64," + base64;
    return await cloudinary.uploader.upload(uploadStr, {
        overwrite: false,
        invalidate: true,
    });
}


const CloudinaryService = {
    uploadBase64
}

module.exports = CloudinaryService