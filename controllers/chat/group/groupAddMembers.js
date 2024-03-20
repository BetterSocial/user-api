const {StreamChat} = require('stream-chat');
const Environment = require('../../../config/environment');
const {CHANNEL_TYPE_STRING, CHANNEL_TYPE} = require('../../../helpers/constants');
const ErrorResponse = require('../../../utils/response/ErrorResponse');
const {ResponseSuccess} = require('../../../utils/Responses');
const _ = require('lodash');
const {User} = require('../../../databases/models');
const BetterSocialCore = require('../../../services/bettersocial');
const UsersFunction = require('../../../databases/functions/users');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const groupAddMembers = async (req, res) => {
  const {userId} = req;
  const {channel_id, members} = req.body;

  const ownUser = await UsersFunction.findUserById(User, userId);

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
    type: CHANNEL_TYPE_STRING.GROUP /* ,
    members: {$in: [userId]} */
  });
  if (channel?.length < 1) {
    return ErrorResponse.e404(res, 'Group not found');
  }

  let all_members = channel[0].data.better_channel_member.map((member) => member.user.id);

  const channelMembers = [userId, ...filteredMembersId];
  const channelToAdd = await client.channel(CHANNEL_TYPE_STRING.GROUP, channel_id, {
    members: channelMembers
  });

  try {
    const responseChannel = await channelToAdd?.addMembers(filteredMembersObject);

    filteredMembersId.map(async (member) => {
      const targetUserModel = await UsersFunction.findUserById(User, member);

      const textOwnUser = `You added ${targetUserModel.username} to this group`;
      const textTargetUser = `${ownUser.username} added you to this group`;
      const textDefaultUser = `${ownUser.username} added ${targetUserModel.username} to this group`;

      await channelToAdd.sendMessage(
        {
          text: textDefaultUser,
          own_text: textOwnUser,
          other_text: textTargetUser,
          other_system_user: member,
          better_type: 'add_member_to_group',
          type: 'system',
          user_id: userId,
          only_to_user_show: userId,
          disable_to_user: false,
          is_from_prepopulated: true,
          system_user: userId,
          isSystem: true,
          members: [member]
        },
        {
          skip_push: true
        }
      );

      const other_members = all_members.filter((m) => m !== member && m !== userId);
      try {
        await BetterSocialCore.fcmToken.sendGroupChatNotification(userId, textOwnUser);
      } catch (error) {
        console.error('Failed to send group chat notification to user', error);
      }
      await BetterSocialCore.fcmToken.sendGroupChatNotification(member, textTargetUser);
      await Promise.all(
        other_members.map(async (m) => {
          await BetterSocialCore.fcmToken.sendGroupChatNotification(m, textDefaultUser);
        })
      );
    });

    try {
      const {betterChannelMember, betterChannelMemberObject, newChannelName, updatedChannel} =
        await BetterSocialCore.chat.updateBetterChannelMembers(
          channelToAdd,
          responseChannel,
          true,
          {
            channelType: CHANNEL_TYPE.GROUP,
            channel_type: CHANNEL_TYPE.GROUP
          }
        );

      updatedChannel.channel.better_channel_member = betterChannelMember;
      updatedChannel.channel.name = newChannelName;

      return ResponseSuccess(res, 'New members have been added to the group', 200, {
        ...updatedChannel,
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
