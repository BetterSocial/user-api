const { POST_VERB_POLL } = require("../../helpers/constants")
const BodyValidationMiddleware = require("../body-validation")

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
const CreatePostMiddleware = (req, res, next) => {
    const { verb, anonimity } = req.body
    if(verb === POST_VERB_POLL && anonimity) return BodyValidationMiddleware.createAnonymousPollPostV2(req, res, next)
    if(verb === POST_VERB_POLL) return BodyValidationMiddleware.createPollPostV2(req, res, next)
    if(anonimity) return BodyValidationMiddleware.createAnonymousPostV2(req, res, next)
    return BodyValidationMiddleware.createPostV2(req, res, next)
}

module.exports = CreatePostMiddleware