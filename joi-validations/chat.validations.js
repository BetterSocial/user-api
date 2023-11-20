const {uuid, array, object, string} = require('./general.validations');

const ChatValidation = {
  changeChannelDetail: {
    body: {
      channel_id: string.required(),
      channel_name: string.optional(),
      channel_image: string.optional()
    }
  },
  getChannelDetail: {
    query: {
      channel_id: string.required(),
      channel_type: string.required()
    }
  },
  sendFollowSystemMessage: {
    body: {
      channel_id: uuid.required(),
      target_follow_user_id: uuid.required()
    }
  },
  findOrCreateChannelBySignedSender: {
    members: array(uuid).min(1)
  },
  moveToAnon: {
    body: object({
      anon_user_info_color_code: string.required(),
      anon_user_info_color_name: string.required(),
      anon_user_info_emoji_code: string.required(),
      anon_user_info_emoji_name: string.required(),
      oldChannelId: string.required(),
      targetUserId: uuid.required()
    })
  },
  moveToSign: {
    body: object({
      oldChannelId: string.required(),
      targetUserId: uuid.required()
    })
  }
};

module.exports = {ChatValidation};
