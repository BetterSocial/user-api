const Schema = {
  user_id_followed: 'string|empty:false',
  follow_source: 'string|empty:false',
  username_follower: 'string|empty:false',
  username_followed: 'string|empty:false'
};

module.exports = Schema;
