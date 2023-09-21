/**
 *
 * @param {import("express").Response} res
 * @param {String} [message = "error"]
 * @param {Number} [code = 500]
 */

const generateErrorResponse = (res, message, code) => {
  return res.status(code).json({
    status: 'error',
    code,
    message
  });
};

const ErrorResponse = {
  e400: (res, message) => generateErrorResponse(res, message, 400),
  e403: (res, message) => generateErrorResponse(res, message, 403),
  e404: (res, message) => generateErrorResponse(res, message, 404),
  e409: (res, message) => generateErrorResponse(res, message, 409),
  e500: (res, message) => generateErrorResponse(res, message, 500)
};

module.exports = ErrorResponse;
