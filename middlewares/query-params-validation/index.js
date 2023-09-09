const Validator = require('fastest-validator');
const QueryParamsValidationSchema = require('./schema');

const v = new Validator();

const GenerateQueryParamsValidation = (schema) => {
  const middleware = (req, res, next) => {
    try {
      const validate = v.validate(req?.query, schema);
      if (validate.length) {
        console.log('error validation', validate);
        return res.status(403).json({
          code: 403,
          status: 'error validation',
          message: validate
        });
      }
    } catch (e) {
      return res.status(409).json({
        code: 409,
        status: 'error validation',
        message: e
      });
    }

    return next();
  };

  return middleware;
};

const QueryParamsValidationMiddleware = {
  searchTopicFollower: GenerateQueryParamsValidation(
    QueryParamsValidationSchema.searchTopicFollower
  )
};

module.exports = QueryParamsValidationMiddleware;
