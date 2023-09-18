const Schema = {
  contentType: {
    type: 'string',
    empty: false,
    enum: ['post']
  }
};

module.exports = Schema;
