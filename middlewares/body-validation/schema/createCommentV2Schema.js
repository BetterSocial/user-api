const Schema = {
  activity_id: 'string|empty:false',
  message: 'string|empty:false',
  anonimity: 'boolean|empty:false',
  sendPostNotif: 'boolean|empty:true'
};

module.exports = Schema;
