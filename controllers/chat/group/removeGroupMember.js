const {StreamChat} = require('stream-chat');
const Environment = require('../../../config/environment');
const BetterSocialCore = require('../../../services/bettersocial');
const {ResponseSuccess} = require('../../../utils/Responses');
const ErrorResponse = require('../../../utils/response/ErrorResponse');
const Getstream = require('../../../vendor/getstream');
const UsersFunction = require('../../../databases/functions/users');
const {User} = require('../../../databases/models');
const {CHANNEL_TYPE_STRING} = require('../../../helpers/constants');

const removeGroupMember = async (req, res) => {
  const {userId} = req;
  const {channelId, targetUserId} = req.body;

  const ownUser = await UsersFunction.findUserById(User, userId);
  const targetUserModel = await UsersFunction.findUserById(User, targetUserId);

  try {
    const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRET);
    const currentChannel = await client.channel(CHANNEL_TYPE_STRING.GROUP, channelId);
    const queriedChannel = await client.queryChannels({
      type: CHANNEL_TYPE_STRING.GROUP,
      id: channelId,
      members: {$in: [userId]}
    });

    let all_members = queriedChannel[0].data.better_channel_member.map((member) => member.user.id);

    const response = await Getstream.chat.removeGroupMember(channelId, userId, targetUserId);
    const {channel, channelApiResponse} = response.data || {};

    let channelResponse;
    try {
      const {newChannelName, betterChannelMember, betterChannelMemberObject, updatedChannel} =
        await BetterSocialCore.chat.updateBetterChannelMembers(channel, channelApiResponse, true);

      const textOwnUser = `You removed ${targetUserModel.username} from this group`;
      const textTargetUser = `${ownUser.username} removed you from this group`;
      const textDefaultUser = `${ownUser.username} removed ${targetUserModel.username} from this group`;

      await currentChannel.sendMessage(
        {
          text: textDefaultUser,
          own_text: textOwnUser,
          other_text: textTargetUser,
          other_system_user: targetUserModel.user_id,
          better_type: 'remove_member_from_group',
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

      await BetterSocialCore.fcmToken.sendGroupChatNotification(
        targetUserModel.user_id,
        textTargetUser
      );

      channelResponse = updatedChannel;

      channelApiResponse.channel.name = newChannelName;
      channelApiResponse.channel.better_channel_member = betterChannelMember;
      channelApiResponse.channel.better_channel_member_object = betterChannelMemberObject;
    } catch (e) {
      console.log(e);
    }

    return ResponseSuccess(res, response?.message, 200, channelResponse);
  } catch (e) {
    return ErrorResponse.e500(res, e.message);
  }
};

module.exports = removeGroupMember;
