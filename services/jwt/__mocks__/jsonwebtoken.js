'use strict';

const jsonwebtoken = jest.createMockFromModule('jsonwebtoken');

const __verify = jest.fn((token, secret, cb) => {
  if (token !== 'valid-token') {
    return cb(new Error('Invalid token'), {});
  }
  return cb(false, {user_id: 'd24f6c17-f20e-4cc9-8df1-45f1fa4dcf52'});
});

jsonwebtoken.sign = jest.fn();
jsonwebtoken.verify = __verify;

module.exports = jsonwebtoken;
