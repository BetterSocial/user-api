const {object, string} = require('./general.validations');

const UserValidation = {
  authenticateWeb: {
    body: object({
      exchangeToken: string.required()
    })
  }
};

module.exports = {UserValidation};
