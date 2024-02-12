const {object, string, boolean, number} = require('./general.validations');

const UserValidation = {
  authenticateWeb: {
    body: object({
      exchangeToken: string.required()
    })
  },
  populateUsers: {
    query: {
      allow_anon_dm: boolean,
      limit: number,
      offset: number
    }
  }
};

module.exports = {UserValidation};
