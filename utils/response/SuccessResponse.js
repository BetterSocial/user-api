/**
 * 
 * @param {import("express").Response} res 
 * @param {Object} data 
 */
const SuccessResponse = (res, data) => {
    return res.status(200).json({
        status: "success",
        code: 200,
        data,
    })
}

module.exports = SuccessResponse