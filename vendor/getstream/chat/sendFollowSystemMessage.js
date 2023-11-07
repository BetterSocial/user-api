const GetstreamSingleton = require('../singleton');

const sendFollowSystemMessage = async (selfUserId, selfUsername, targetUserId, targetUsername) => {
  if (!selfUsername || !selfUserId || !targetUserId) {
    throw new Error('Missing params');
  }

  const client = GetstreamSingleton.getChatInstance();
  try {
    const channels = await client.queryChannels({
      members: {$eq: [selfUserId, targetUserId]},
      member_count: 2,
      type: 'messaging'
    });

    if (channels?.length === 0) {
      console.debug('Channel not found');
      return false;
    }

    const channel = channels[0];

    channel.sendMessage(
      {
        text: `${selfUsername} followed you. Say 'Hi' back!`,
        user_id: selfUserId,
        system_user: selfUserId,
        is_from_prepopulated: true,
        type: 'system',
        other_text: `You followed ${targetUsername}. Say 'Hi'!`
      },
      {
        skip_push: true
      }
    );

    return true;
  } catch (e) {
    console.debug('Error sending message', e);
    return false;
  }
};

module.exports = sendFollowSystemMessage;
