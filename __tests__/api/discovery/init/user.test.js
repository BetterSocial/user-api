const request = require('supertest');
const app = require('../../../../app');
const {createReusableAuthTestSuite} = require('../../__authTest__/createReusableAuthTestSuite');

describe('GET /discovery/init/user', () => {
  createReusableAuthTestSuite(request(app).post('/discovery/init/user'));
});
