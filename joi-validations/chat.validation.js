const {uuid} = require('./general.validations');

const ChatValidation = {
  sendFollowSystemMessage: {
    body: {
      channel_id: uuid.required(),
      target_follow_user_id: uuid.required()
    }
  }
};

module.exports = {ChatValidation};
