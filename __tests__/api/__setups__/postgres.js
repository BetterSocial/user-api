const {sequelize} = require('../../../databases/models');
const {phpArtisan} = require('./utils');

beforeEach(async () => {
  await phpArtisan('migrate:fresh --seed');
});

afterAll(async () => {
  await sequelize.close();
});
