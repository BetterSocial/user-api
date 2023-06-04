/**
 * @typedef Data
 * @property {string} user_id
 * @property {string} channelId
 * @property {string} message
 */
/**
 * @param {Data} data
 *
 * @example
 * saveChat({
 * user_id:'xxxx-xxxx-xxxx-xxxx',
 * channelId:'channel1',
 * message:'hello world'
 * })
 */
exports.saveChat = async (data) => {
  if (!data.user_id) throw new Error('user_id required');
  if (!data.channelId) throw new Error('channelId required');
  if (!data.message) throw new Error('message required');

  return await Chat.create(data);
};
