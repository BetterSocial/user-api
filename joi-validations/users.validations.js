const {object, string} = require('./general.validations');

const UserValidation = {
  authenticateWeb: {
    body: object({
      country_code: string.max(2).min(2).uppercase().required(),
      human_id: string.required()
    })
  }
};

module.exports = {UserValidation};
