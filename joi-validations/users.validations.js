const Joi = require('joi');
const {object, string, boolean, number, uuid} = require('./general.validations');

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
  },
  checkAllowDm: {
    query: {
      source: string.required(),
      post_id: uuid.when('source', {
        is: 'post',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      comment_id: uuid.when('source', {
        is: 'comment',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    }
  }
};

module.exports = {UserValidation};
