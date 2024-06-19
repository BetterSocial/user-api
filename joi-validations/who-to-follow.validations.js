const {string, boolean, array, number} = require('./general.validations');

const WhoToFollowValidation = {
  list: {
    query: {
      topics: array(string),
      locations: array(string),
      page: number.default(1),
      includeAdmin: boolean.default(false)
    }
  }
};

module.exports = {WhoToFollowValidation};
