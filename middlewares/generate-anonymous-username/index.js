const { POST_VERB_POLL } = require("../../helpers/constants")
const ErrorResponse = require("../../utils/response/ErrorResponse")
const BodyValidationMiddleware = require("../body-validation")

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
const GenerateAnonymousUsernameMiddleware = (req, res, next) => {
    const { contentType } = req?.body
    if(contentType === 'post') return BodyValidationMiddleware.generatePostAnonymousUsername(req, res, next)
    else if(contentType === 'comment') return BodyValidationMiddleware.generateCommentAnonymousUsername(req, res, next)

    return ErrorResponse.e403(res, "Invalid content type")
}

module.exports = GenerateAnonymousUsernameMiddleware