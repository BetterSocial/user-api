const {uuid, array, object, string, number} = require('./general.validations');

const ChatValidation = {
  addMembers: {
    body: {
      channel_id: string.required().messages({
        'any.required': 'Channel id is required',
        'string.empty': 'Channel id is required'
      }),
      members: array(uuid).min(1).required().messages({
        'any.required': 'Members is required',
        'array.min': 'Members must be at least 1',
        'uuid.base': 'Members must be an array of uuid'
      })
    }
  },
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
  },
  initChatFromPost: {
    body: object({
      targetUserId: uuid.required()
    })
  },
  searchGif: {
    query: {
      q: string.required(),
      limit: number,
      country: string.default('US'),
      locale: string.default('en_US'),
      contentFilter: string.default('off'),
      ar_range: string.default('all'),
      media_filter: string.default('gif,tinygif')
    }
  },
  listTrendingGif: {
    query: {
      limit: number,
      country: string.default('US'),
      locale: string.default('en_US'),
      contentFilter: string.default('off'),
      ar_range: string.default('all'),
      media_filter: string.default('gif,tinygif')
    }
  },
  registerShareGif: {
    query: {
      id: string.required(),
      q: string,
      country: string.default('US'),
      locale: string.default('en_US')
    }
  },

  removeGroupMember: {
    body: {
      channelId: string.required(),
      targetUserId: uuid.required()
    }
  }
};

module.exports = {ChatValidation};
