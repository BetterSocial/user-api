const {string} = require('./general.validations');

const TopicValidation = {
  latestPost: {
    query: {
      name: string.required()
    }
  },
  checkName: {
    query: {
      name: string.required()
    }
  },
  create: {
    body: {
      name: string.required()
    }
  }
};

module.exports = {TopicValidation};
