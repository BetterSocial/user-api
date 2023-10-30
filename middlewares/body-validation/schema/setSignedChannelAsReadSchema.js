const {CHANNEL_TYPE} = require('../../../helpers/constants');

const Schema = {
  channelId: 'string|empty:false',
  channelType: {
    type: 'enum',
    values: Object.values(CHANNEL_TYPE),
    empty: false
  }
};

module.exports = Schema;
