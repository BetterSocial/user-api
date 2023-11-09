const {uuid, array} = require('./general.validations');

const ChatValidation = {
  sendFollowSystemMessage: {
    body: {
      channel_id: uuid.required(),
      target_follow_user_id: uuid.required()
    }
  },
  findOrCreateChannelBySignedSender: {
    members: array(uuid).min(1)
  }
};

module.exports = {ChatValidation};
