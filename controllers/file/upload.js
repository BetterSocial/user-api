const cloudinary = require("cloudinary");
const Validator = require("fastest-validator");

const v = new Validator();

module.exports = async(req, res) => {
    try {
        const schema = {
            picture: "string|stringBase64|empty:false",
        };
        const validate = v.validate(req.body, schema);
        if (validate.length) {
            return res.status(403).json({
            code: 403,
            status: "error",
            message: validate,
        });
    }
    } catch(e) {
        return res.status(403).json({
            code: 403,
            status: "error ",
            message: "e",
        })
    }
    const uploadStr = req.body.picture;
    let returnCloudinary = await cloudinary.v2.uploader.upload(uploadStr, {
      overwrite: false,
      invalidate: true,
    });

    if(returnCloudinary) {
        return res.status(403).json({
            code: 200,
            status: "success",
            message: "Picture has been successfully uploaded",
            data : {
                url : returnCloudinary.secure_url
            }
        })
    }

    return res.status(403).json({
        code: 403,
        status: "error",
        message: "Error uploading picture",
    })
}