const { POST_VERB_POLL } = require("../../helpers/constants")
const BodyValidationMiddleware = require("../body-validation")

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
const CreateCommentChildMiddleware = (req, res, next) => {
    const { anonimity } = req.body
    if(anonimity) return BodyValidationMiddleware.createAnonymousCommentChildV2(req, res, next)
    return BodyValidationMiddleware.createCommentChildV2(req, res, next)
}

module.exports = CreateCommentChildMiddleware