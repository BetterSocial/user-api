/**
 *
 * @param {StreamChat} chatClient
 * @param {*} token
 * @param {*} channelId
 * @param {*} message
 * @returns
 */
const sendSystemMessageForTokenHolder = async (
  chatClient,
  token,
  channelId,
  message,
  additionalData = {}
) => {
  const channel = chatClient.channel('messaging', channelId);
  const createdChannel = await channel.create();

  await channel.update(
    {
      ...createdChannel?.channel
    },
    {
      text: message,
      silent: true,
      user_id: chatClient?.userId,
      ...additionalData
    },
    {
      skip_push: true
    }
  );

  return channel;
};

module.exports = sendSystemMessageForTokenHolder;
