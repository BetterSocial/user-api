// eslint-disable-next-line no-unused-vars
const {Channel} = require('stream-chat');

/**
 * @typedef {Object} SendSystemMessageOptionalParams
 * @property {string} [other_system_user]
 * @property {'follow_user' | 'follow_topic' | 'new_topic_post' | 'add_member_to_group' | 'remove_member_from_group' | 'change_channel_detail' | 'leave_group'}  [better_type]
 * @property {boolean} [ignore_update_timestamp=false]
 * @property {boolean} [ignore_unread_count=false]
 * @property {boolean} [isSystem = true]
 * @property {boolean} [only_show_to_system_user=false]
 * @property {boolean} [skip_push=true]
 * @property {string} [other_text='']
 * @property {string} [own_text='']
 * @property {string} [type='system']
 * @property {string} [post_expired_at]
 *
 */

/**
 *
 * @param {Channel} channel
 * @param {string} systemMessageTriggerActorUserId
 * @param {string} text
 * @param {SendSystemMessageOptionalParams} otherParams
 * @returns {Promise<Channel | null>}
 */
async function sendBaseSystemMessage(
  channel,
  systemMessageTriggerActorUserId,
  text,
  otherParams = {}
) {
  const {
    better_type = null,
    ignore_unread_count = false,
    ignore_update_timestamp = false,
    isSystem = true,
    only_show_to_system_user = false,
    other_system_user = null,
    other_text = '',
    own_text = '',
    skip_push = true,
    type = 'system',
    post_expired_at = null
  } = otherParams;
  try {
    const response = await channel.sendMessage(
      {
        user_id: systemMessageTriggerActorUserId,
        text,
        other_text: other_text,
        own_text: own_text,
        system_user: systemMessageTriggerActorUserId,
        isSystem,
        type,
        only_show_to_system_user,
        other_system_user,
        better_type,
        ignore_unread_count,
        ignore_update_timestamp,
        post_expired_at
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
