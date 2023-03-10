const Validator = require('fastest-validator');
const BodyValidationSchema = require('./schema');
const v = new Validator();

const GenerateBodyValidationMiddleware = (schema) => {
    const middleware = (req, res, next) => {
        const validate = v.validate(req?.body, schema);
        if (validate.length) {
            console.log("error validation", validate)
            return res.status(403).json({
                code: 403,
                status: "error validation",
                message: validate,
            });
        }

        return next();
    }

    return middleware;
}

const BodyValidationMiddleware = {
    followUserV2 : GenerateBodyValidationMiddleware(BodyValidationSchema.followUserV2),
    unfollowUserV2 : GenerateBodyValidationMiddleware(BodyValidationSchema.unfollowUserV2),
    registerV2: GenerateBodyValidationMiddleware(BodyValidationSchema.registerV2),
}

module.exports =  BodyValidationMiddleware;