const {StreamChat} = require('stream-chat');
const Environment = require('../../../config/environment');
const BetterSocialCore = require('../../../services/bettersocial');
const {ResponseSuccess} = require('../../../utils/Responses');
const ErrorResponse = require('../../../utils/response/ErrorResponse');
const Getstream = require('../../../vendor/getstream');
const UsersFunction = require('../../../databases/functions/users');
const {User} = require('../../../databases/models');
const {CHANNEL_TYPE_STRING} = require('../../../helpers/constants');

const leaveGroupMember = async (req, res) => {
  const {userId} = req;
  const {channelId} = req.body;

  const ownUser = await UsersFunction.findUserById(User, userId);

  try {
    let channelResponse;

    const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRET);
    const currentChannel = await client.channel(CHANNEL_TYPE_STRING.GROUP, channelId);
    const queriedChannel = await client.queryChannels({
      type: CHANNEL_TYPE_STRING.GROUP,
      id: channelId
    });

    let all_members = queriedChannel[0].data.better_channel_member.map((member) => member.user.id);

    const textOwnUser = `You left this group`;
    const textTargetUser = `${ownUser.username} left this group`;
    const textDefaultUser = `${ownUser.username} left this group`;

    await currentChannel.sendMessage(
      {
        text: textDefaultUser,
        own_text: textOwnUser,
        other_text: textTargetUser,
        better_type: 'leave_group',
        type: 'system',
        user_id: userId,
        only_to_user_show: userId,
        disable_to_user: false,
        is_from_prepopulated: true,
        system_user: userId,
        isSystem: true,
        members: all_members
      },
      {
        skip_push: true
      }
    );

    const response = await Getstream.chat.removeGroupMember(channelId, userId);
    const {channel, channelApiResponse} = response.data || {};

    const {newChannelName, betterChannelMember, betterChannelMemberObject, updatedChannel} =
      await BetterSocialCore.chat.updateBetterChannelMembers(channel, channelApiResponse, false);

    channelResponse = updatedChannel;

    channelApiResponse.channel.name = newChannelName;
    channelApiResponse.channel.better_channel_member = betterChannelMember;
    channelApiResponse.channel.better_channel_member_object = betterChannelMemberObject;

    return ResponseSuccess(res, response?.message, 200, channelResponse);
  } catch (e) {
    return ErrorResponse.e500(res, e.message);
  }
};

module.exports = leaveGroupMember;
