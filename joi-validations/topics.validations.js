const {string} = require('./general.validations');

const TopicValidation = {
  latestPost: {
    query: {
      name: string.required()
    }
  },
  checkName: {
    body: {
      name: string.required()
    }
  }
};

module.exports = {TopicValidation};
