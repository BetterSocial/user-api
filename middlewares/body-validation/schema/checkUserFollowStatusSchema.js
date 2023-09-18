const Schema = {
  targetUserIds: {
    type: 'array',
    items: {
      type: 'string'
    },
    min: 1,
    max: 10
  }
};

module.exports = Schema;
