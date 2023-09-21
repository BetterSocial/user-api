const InvariantError = require('../../exceptions/InvariantError');
const {GetTopicPagesPayloadSchema, GetTopicPageByIdPayloadSchema} = require('./schema');

const Validator = require('fastest-validator');
const v = new Validator();

const TopicPageValidator = {
  validateGetTopicPages: (payload) => {
    const validate = v.validate(payload, GetTopicPagesPayloadSchema);
    if (validate.length) {
      throw new InvariantError(validate[0].message);
    }
  },
  validateGetTopicPageByID: (payload) => {
    const validate = v.validate(payload, GetTopicPageByIdPayloadSchema);
    if (validate.length) {
      throw new InvariantError(validate[0].message);
    }
  }
};

module.exports = TopicPageValidator;
