const { POST_VERB_POLL } = require("../../helpers/constants")
const BodyValidationMiddleware = require("../body-validation")

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
const CreateCommentMiddleware = (req, res, next) => {
    const { anonimity } = req?.body
    if(anonimity) return BodyValidationMiddleware.createAnonymousCommentV2(req, res, next)
    return BodyValidationMiddleware.createCommentV2(req, res, next)
}

module.exports = CreateCommentMiddleware