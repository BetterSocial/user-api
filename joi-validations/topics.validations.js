const {string} = require('./general.validations');

const TopicValidation = {
  latestPost: {
    query: {
      name: string.required()
    }
  },
  checkName: {
    query: {
      name: string.min(3).required()
    }
  },
  create: {
    body: {
      name: string.min(3).required()
    }
  }
};

module.exports = {TopicValidation};
