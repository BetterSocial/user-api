const {ResponseSuccess} = require('../../utils/Responses');

const SuccessMiddleware = (_, res) => {
  ResponseSuccess(res, 'OK', 200);
};

module.exports = SuccessMiddleware;
