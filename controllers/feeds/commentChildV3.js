const BetterSocialCore = require("../../services/bettersocial");
const ErrorResponse = require("../../utils/response/ErrorResponse");
const SuccessResponse = require("../../utils/response/SuccessResponse");

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
const standart = async (req, res) => {
  try {
    let response = await BetterSocialCore.post.commentChildV3(req);
    if(response?.isSuccess) return SuccessResponse(res, response.data, "Comment created successfully");
    return ErrorResponse.e500(res, "Failed to create comment: " + response?.message);
  } catch(e) {
    return ErrorResponse.e500(res, e.message)
  }
}

const anonymous = async (req, res) => {
  try {
    let response = await BetterSocialCore.post.commentChildV3Anonymous(req);
    if(response?.isSuccess) return SuccessResponse(res, response.data, "Comment created successfully");
    return ErrorResponse.e500(res, "Failed to create comment: " + response?.message);
  } catch(e) {
    return ErrorResponse.e500(res, e.message)
  }
}

module.exports = {
  standart,
  anonymous
}