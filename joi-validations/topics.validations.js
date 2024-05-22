const {string, url, array} = require('./general.validations');

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
  },
  inviteMembers: {
    body: {
      member_ids: array(string.required()),
      topic_id: string.required()
    }
  }
};

module.exports = {TopicValidation};
