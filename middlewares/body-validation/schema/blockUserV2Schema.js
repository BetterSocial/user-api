const Schema = {
  userId: 'string',
  source: 'string',
  postId: 'string|optional:true',
  reason: 'array|optional:true',
  message: 'string|optional:true'
};

module.exports = Schema;
