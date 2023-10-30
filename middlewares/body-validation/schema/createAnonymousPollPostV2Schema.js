const Schema = {
  message: 'string',
  verb: 'string|empty:false',
  feedGroup: 'string|empty:false',
  privacy: 'string|empty:false',
  anonimity: 'boolean|empty:false',
  location: 'string|empty:false',
  duration_feed: 'string|empty:false',
  polls: 'array|empty:false',
  pollsduration: {
    $$type: 'object',
    day: 'number|empty:false',
    hour: 'number|empty:false',
    minute: 'number|empty:false'
  },
  multiplechoice: 'boolean|empty:false',
  topics: 'array|empty:true',
  location_id: 'string|empty:true',
  anon_user_info: {
    $$type: 'object',
    color_name: 'string|empty:false',
    color_code: 'string|empty:false',
    emoji_name: 'string|empty:false',
    emoji_code: 'string|empty:false'
  }
};

module.exports = Schema;
