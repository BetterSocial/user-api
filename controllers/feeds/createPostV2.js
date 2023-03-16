const ErrorResponse = require("../../utils/response/ErrorResponse");
const BetterSocialCore = require("../../services/bettersocial");
const SuccessResponse = require("../../utils/response/SuccessResponse");

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
module.exports = async (req, res) => {
  try {
    const { anonimity } = req?.body
    let response = await BetterSocialCore.post.createPost(req, anonimity)
    
    if(!response?.isSuccess) return ErrorResponse.e500(res, "Failed to create post \n" + response?.message) 
    return SuccessResponse(res, "Post created successfully")
  } catch (e) {
    return ErrorResponse.e500(res, e.message)
  }
};
