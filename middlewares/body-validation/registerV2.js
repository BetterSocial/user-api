const Validator = require('fastest-validator');
const v = new Validator();

const schema = {
    users: {
        $$type: "object|empty:false",
        username: "string|empty:false",
        human_id: "string|empty:false",
        country_code: "string|empty:false",
        real_name: "string|optional: true",
        profile_pic_path: "string|base64|optional: true",
    },
    local_community: "string[]",
    topics: "string[]|empty:false",
    follows: "string[]|optional:true",
    follow_source: "string|empty:false",
};

const RegisterV2BodyValidationMiddleware = (req, res, next) => {
    const validate = v.validate(req?.body?.data, schema);
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

module.exports = RegisterV2BodyValidationMiddleware;