const {string} = require('./general.validations');

const TopicValidation = {
  latestPost: {
    query: {
      name: string.required()
    }
  }
};

module.exports = {TopicValidation};
