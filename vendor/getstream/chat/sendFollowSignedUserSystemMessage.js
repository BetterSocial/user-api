// eslint-disable-next-line no-unused-vars
const {Channel} = require('stream-chat');
const sendBaseSystemMessage = require('./sendBaseSystemMessage');

/**
 *
 * @param {Channel} channel
 * @param {string} systemMessageTriggerActorUserId
 * @param {string} systemMessageTriggerActorUsername
 * @param {string} followedUsername
 */
async function SendFollowSignedUserSystemMessage(
  channel,
  systemMessageTriggerActorUserId,
  systemMessageTriggerActorUsername,
  followedUsername
) {
  if (!channel || !systemMessageTriggerActorUserId || !systemMessageTriggerActorUsername) {
    throw new Error('Missing params');
  }

  const own_text = `You started following ${followedUsername}.\nSend them a message now`;
  const target_text = `${systemMessageTriggerActorUsername} started following you.\nSend them a message now`;

  console.log(own_text, target_text);

  return sendBaseSystemMessage(channel, systemMessageTriggerActorUserId, own_text, {
    own_text,
    other_text: target_text
  });
}

module.exports = SendFollowSignedUserSystemMessage;
