const bcrypt = require('bcrypt');

const BetterSocialCheckPasswordForDemoLogin = (password) =>
  bcrypt.compareSync(password, process.env.BACKDOOR_PASSWORD);

module.exports = BetterSocialCheckPasswordForDemoLogin;
