const {StreamChat} = require('stream-chat');
const Environment = require('../../../config/environment');
const {CHANNEL_TYPE_STRING, CHANNEL_TYPE} = require('../../../helpers/constants');
const ErrorResponse = require('../../../utils/response/ErrorResponse');
const {ResponseSuccess} = require('../../../utils/Responses');
const _ = require('lodash');
const BetterSocialCore = require('../../../services/bettersocial');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const groupAddMembers = async (req, res) => {
  const {userId} = req;
  const {channel_id, members} = req.body;

  const filteredMembers = members.reduce(
    (acc, next) => {
      if (next === userId) return acc;

      acc?.[0]?.push({
        user_id: next,
        role: 'channel_moderator'
      });

      acc?.[1]?.push(next);

      return acc;
    },
    [[], []]
  );

  const [filteredMembersObject, filteredMembersId] = filteredMembers;

  if (filteredMembersId.length < 1) {
    return ErrorResponse.e400(res, 'You cannot add yourself to the group');
  }

  const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRET);

  const channel = await client.queryChannels({
    id: channel_id,
    type: CHANNEL_TYPE_STRING.GROUP,
    members: {$in: [userId]}
  });

  if (channel?.length < 1) {
    return ErrorResponse.e404(res, 'Group not found');
  }

  const channelMembers = [userId, ...filteredMembersId];
  const channelToAdd = await client.channel(CHANNEL_TYPE_STRING.GROUP, channel_id, {
    members: channelMembers
  });

  try {
    const responseChannel = await channelToAdd?.addMembers(filteredMembersObject);

    try {
      const {betterChannelMember, betterChannelMemberObject, newChannelName} =
        await BetterSocialCore.chat.updateBetterChannelMembers(
          channelToAdd,
          responseChannel,
          true,
          {
            channelType: CHANNEL_TYPE.GROUP,
            channel_type: CHANNEL_TYPE.GROUP
          }
        );

      responseChannel.channel.better_channel_member = betterChannelMember;
      responseChannel.channel.name = newChannelName;

      return ResponseSuccess(res, 'New members have been added to the group', 200, {
        ...responseChannel,
        better_channel_member: betterChannelMember,
        better_channel_member_object: betterChannelMemberObject,
        name: newChannelName
      });
    } catch (e) {
      console.error('Failed to update channel', e);
      return ErrorResponse.e500(res, e.message);
    }
  } catch (e) {
    console.log(e);
    return ErrorResponse.e500(res, e.message);
  }
};

module.exports = groupAddMembers;