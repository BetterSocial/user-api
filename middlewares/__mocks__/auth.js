const TestConstants = require('../../__tests__/api/__utils__/constant');

module.exports = {
  ...jest.requireActual('../auth'),
  isAuth: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === null || authHeader === undefined) {
      return res.status(401).json({
        code: 401,
        data: null,
        message: 'Token not provided'
      });
    }

    const token = authHeader.split(' ')[1];
    if (token === null || token === undefined) {
      return res.status(401).json({
        code: 401,
        data: null,
        message: 'Token not provided'
      });
    }
    req.userId = TestConstants.MY_USER_ID;
    next();
  },
  isAuthV2: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === null || authHeader === undefined) {
      return res.status(401).json({
        code: 401,
        data: null,
        message: 'Token not provided'
      });
    }

    const token = authHeader.split(' ')[1];
    if (token === null || token === undefined) {
      return res.status(401).json({
        code: 401,
        data: null,
        message: 'Token not provided'
      });
    }
    req.userId = TestConstants.MY_USER_ID;
    req.token = token;
    next();
  }
};
