const BetterSocialCore = require("../../services/bettersocial")
const ErrorResponse = require("../../utils/response/ErrorResponse")
const SuccessResponse = require("../../utils/response/SuccessResponse")

module.exports = async(req, res) => {
    const {token, userId: selfUserId} = req
    const {postId, source = "", reason = [], message = ""} = req.body

    let response = await BetterSocialCore.post.blockAnonymousPost(token, selfUserId, postId, source, {message, reason})
    if(response?.isSuccess) {
        return SuccessResponse(res, null, response?.message || "This Anonymous post has been blocked successfully")
    }

    return ErrorResponse.e500(res, response?.message || "Error in block anonymous post")
}