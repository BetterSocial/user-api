/**
 *
 * @param {StreamChat} chatClient
 * @param {*} selfUserId
 * @param {*} targetUserId
 * @returns
 */
const findPmChannel = async (chatClient, selfUserId, targetUserId) => {
  try {
    const members = [selfUserId, targetUserId];
    const channel = await chatClient.channel('messaging', {
      members
    });

    await channel.create();

    return channel;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = findPmChannel;
