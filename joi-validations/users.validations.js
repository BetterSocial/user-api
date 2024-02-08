const {object, string, boolean} = require('./general.validations');

const UserValidation = {
  authenticateWeb: {
    body: object({
      exchangeToken: string.required()
    })
  },
  populateUsers: {
    query: {
      allow_anon_dm: boolean
    }
  }
};

module.exports = {UserValidation};
