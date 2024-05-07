// eslint-disable-next-line no-unused-vars
const {StreamChat} = require('stream-chat');

/**
 * @typedef GetstreamGetTargetUser
 * @property {[import('stream-chat').ChannelMemberResponse]} users
 * @property {[import('stream-chat').ChannelMemberResponse]} originalMembers
 * @property {import('stream-chat').ChannelResponse} channel
 */

/**
 *
 * @param {StreamChat} chatClient
 * @param {string} selfUserId
 * @param {string} targetUserId
 * @returns {Promise<GetstreamGetTargetUser>}
 */
const getTargetUserIdByChannelId = async (chatClient, selfUserId, channelId) => {
  if (!chatClient) throw new Error('Getstream chat client is required');
  if (!selfUserId) throw new Error('Self actor user id is required');
  if (!channelId) throw new Error('Channel id is required');

  let targetUsers, createdChannel, channelMembers;

  try {
    const channel = await chatClient?.channel('messaging', channelId);
    createdChannel = await channel.create();

    channelMembers = createdChannel?.channel?.better_channel_member;
    targetUsers = channelMembers?.filter((member) => {
      return member?.user_id !== selfUserId;
    });
  } catch (e) {
    console.error('Get channel failed', e);
  }

  return {
    users: targetUsers,
    channel: createdChannel,
    originalMembers: channelMembers
  };
};

module.exports = getTargetUserIdByChannelId;
