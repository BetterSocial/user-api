const schema = {
  name: {
    type: 'string',
    empty: false
  },
  search: 'string|optional:true|min:3'
};

module.exports = schema;
