const {string, url} = require('./general.validations');

const TopicValidation = {
  latestPost: {
    query: {
      name: string.required()
    }
  },
  updateTopic: {
    body: {
      icon: url,
      cover: url
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
