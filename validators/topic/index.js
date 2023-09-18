const Validator = require('fastest-validator');
const InvariantError = require('../../exceptions/InvariantError');
const {getTopicFollowPayloadSchema, putTopicFollowPayloadSchema} = require('./schema');
const v = new Validator();

const TopicValidator = {
  validateGetTopicFollow: (payload) => {
    const validate = v.validate(payload, getTopicFollowPayloadSchema);
    if (validate.length) {
      throw new InvariantError(validate[0].message);
    }
  },
  validatePutTopicFollow: (payload) => {
    const validate = v.validate(payload, putTopicFollowPayloadSchema);
    if (validate.length) {
      throw new InvariantError(validate[0].message);
    }
  }
};

module.exports = TopicValidator;
