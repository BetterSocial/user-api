// eslint-disable-next-line no-unused-vars
const {Channel} = require('stream-chat');
const sendBaseSystemMessage = require('./sendBaseSystemMessage');

/**
 * @typedef {Object} SendSystemMessageOptionalParams
 * @property {boolean} [isJoinedAnonymous = false]
 */

/**
 *
 * @param {Channel} channel
 * @param {string} systemMessageTriggerActorUserId
 * @param {SendSystemMessageOptionalParams} [otherParams]
 */
async function sendFollowTopicSystemMessage(
  channel,
  systemMessageTriggerActorUserId,
  otherParams = {}
) {
  if (!channel || !systemMessageTriggerActorUserId) {
    throw new Error('Missing params');
  }

  const {isJoinedAnonymous} = otherParams;
  let own_text = 'You joined this community';
  if (isJoinedAnonymous) own_text += ' incognito';

  return sendBaseSystemMessage(channel, systemMessageTriggerActorUserId, own_text, {
    only_show_to_system_user: true,
    own_text
  });
}

module.exports = sendFollowTopicSystemMessage;
