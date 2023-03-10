const ErrorResponse = require("../../utils/Response/ErrorResponse")
const SuccessResponse = require("../../utils/response/SuccessResponse")

module.exports = async(req, res) => {
    const {user_id_followed, follow_source} = req?.body    

    console.log(req?.userId)
    if(req?.userId === user_id_followed) return ErrorResponse.e403(res, "You can't follow yourself")
    
    return SuccessResponse(res, {
        message: "User has been followed successfully"
    })
}