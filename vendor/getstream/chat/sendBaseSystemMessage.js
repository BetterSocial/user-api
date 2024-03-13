// eslint-disable-next-line no-unused-vars
const {Channel} = require('stream-chat');

/**
 * @typedef {Object} SendSystemMessageOptionalParams
 * @property {string} [own_text='']
 * @property {string} [other_text='']
 * @property {boolean} [only_show_to_system_user=false]
 * @property {boolean} [skip_push=true]
 *
 */

/**
 *
 * @param {Channel} channel
 * @param {string} systemMessageTriggerActorUserId
 * @param {string} text
 * @param {SendSystemMessageOptionalParams} otherParams
 * @returns {Channel | null}
 */
async function sendBaseSystemMessage(
  channel,
  systemMessageTriggerActorUserId,
  text,
  otherParams = {}
) {
  const {
    only_show_to_system_user = false,
    other_text = '',
    own_text = '',
    skip_push = true
  } = otherParams;
  try {
    const response = await channel.sendMessage(
      {
        user_id: systemMessageTriggerActorUserId,
        text,
        other_text: other_text,
        own_text: own_text,
        system_user: systemMessageTriggerActorUserId,
        isSystem: true,
        type: 'system',
        only_show_to_system_user
      },
      {
        skip_push
      }
    );

    return response;
  } catch (e) {
    console.error('Error sending message', e);
    return null;
  }
}

module.exports = sendBaseSystemMessage;
