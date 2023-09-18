const Schema = {
  activity_id: 'string|empty:false',
  message: 'string|empty:false',
  sendPostNotif: 'boolean|empty:true',
  anonimity: 'boolean|empty:false',
  anon_user_info: {
    $$type: 'object',
    color_name: 'string|empty:false',
    color_code: 'string|empty:false',
    emoji_name: 'string|empty:false',
    emoji_code: 'string|empty:false'
  }
};

module.exports = Schema;
