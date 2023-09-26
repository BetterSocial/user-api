const supertest = require('supertest');

const app = require('../../../app');
const {createReusableAuthTestSuite} = require('../__authTest__/createReusableAuthTestSuite');

describe('GET /discovery/user', () => {
  createReusableAuthTestSuite(supertest(app).get('/discovery/user'));
});
