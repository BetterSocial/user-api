const removeGroupMember = async (channelId, selfUserId, targetUserId) => {
  const {CHANNEL_TYPE_STRING} = require('../../../helpers/constants');
  const GetstreamSingleton = require('../../../vendor/getstream/singleton');

  const client = GetstreamSingleton.getChatInstance();

  const queryChannel = await client.queryChannels({
    id: channelId,
    type: CHANNEL_TYPE_STRING.GROUP,
    members: {$in: [selfUserId, targetUserId]}
  });

  if (!queryChannel.length) throw new Error('Group not found');

  const channel = await client.channel(CHANNEL_TYPE_STRING.GROUP, channelId);
  if (!channel) throw new Error('Group not found');

  const isSelfInGroup = channel.state.members[selfUserId];
  if (!isSelfInGroup) throw new Error(`You don't have permission to remove member from this group`);

  const isTargetInGroup = channel.state.members[targetUserId];
  if (!isTargetInGroup) throw new Error(`Target user is not in this group`);

  const response = await channel.removeMembers([targetUserId]);
  return {
    success: true,
    message: 'Group member has been removed',
    data: {
      channel: channel,
      channelApiResponse: response
    }
  };
};

module.exports = removeGroupMember;
