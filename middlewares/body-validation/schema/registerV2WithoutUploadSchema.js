const Schema = {
  data: {
    $$type: 'object|empty:false',
    users: {
      $$type: 'object|empty:false',
      username: 'string|empty:false',
      human_id: 'string|empty:false',
      country_code: 'string|empty:false',
      real_name: 'string|optional: true',
      profile_pic_path: 'string|optional: true'
    },
    local_community: 'string[]',
    topics: 'string[]|empty:false',
    follows: 'string[]|optional:true',
    follow_source: 'string|empty:false'
  }
};

module.exports = Schema;
