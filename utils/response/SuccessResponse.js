/**
 * 
 * @param {import("express").Response} res 
 * @param {Object} data 
 */
const SuccessResponse = (res, data, message = "") => {
    return res.status(200).json({
        status: "success",
        code: 200,
        message,
        data,
    })
}

module.exports = SuccessResponse