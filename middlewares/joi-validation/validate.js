const Joi = require('joi');
const httpStatus = require('http-status');

const Pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

const validate = (schema) => (req, res, next) => {
  const validSchema = Pick(schema, ['params', 'query', 'body']);
  const object = Pick(req, Object.keys(validSchema));
  const {value, error} = Joi.compile(validSchema)
    .prefs({errors: {label: 'key'}})
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return res.status(httpStatus.BAD_REQUEST).json({
      code: httpStatus.BAD_REQUEST,
      message: errorMessage
    });
  }
  Object.assign(req, value);
  return next();
};

module.exports = {validate};
