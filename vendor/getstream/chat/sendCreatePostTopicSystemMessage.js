// eslint-disable-next-line no-unused-vars
const {Channel} = require('stream-chat');
const sendBaseSystemMessage = require('./sendBaseSystemMessage');

/**
 * @typedef {Object} SendCreatePostTopicSystemMessage
 * @property {boolean} [isAnonimous = false]
 */

/**
 *
 * @param {Channel} channel
 * @param {string} systemMessageTriggerActorUserId
 * @param {string} systemMesssageTriggerActorUsername
 * @param {SendCreatePostTopicSystemMessage} [otherParams]
 */
async function sendCreatePostTopicSystemMessage(
  channel,
  systemMessageTriggerActorUserId,
  systemMesssageTriggerActorUsername,
  otherParams = {}
) {
  if (!channel || !systemMessageTriggerActorUserId || !systemMesssageTriggerActorUsername) {
    throw new Error('Missing params');
  }

  const {post_expired_at} = otherParams;
  let text = `There are new posts from ${systemMesssageTriggerActorUsername} & others`;

  return await sendBaseSystemMessage(channel, systemMessageTriggerActorUserId, text, {
    isSystem: false,
    type: 'regular',
    better_type: 'new_topic_post',
    post_expired_at
  });
}

module.exports = sendCreatePostTopicSystemMessage;
