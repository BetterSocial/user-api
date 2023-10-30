const TestConstants = require('../__tests__/api/__utils__/constant');

const jsonwebtoken = jest.createMockFromModule('jsonwebtoken');

const __verify = jest.fn((token, secret, cb) => {
  if (token !== 'valid-token' && token !== 'token' && token !== 'anon-token') {
    return cb(new Error('Invalid token'), {});
  }

  if (token === 'anon-token') return cb(false, {user_id: TestConstants.MY_ANONYMOUS_USER_ID});

  return cb(false, {user_id: TestConstants.MY_USER_ID});
});

jsonwebtoken.sign = jest.fn();
jsonwebtoken.verify = __verify;

module.exports = jsonwebtoken;
