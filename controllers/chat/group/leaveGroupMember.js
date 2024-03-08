const BetterSocialCore = require('../../../services/bettersocial');
const {ResponseSuccess} = require('../../../utils/Responses');
const ErrorResponse = require('../../../utils/response/ErrorResponse');
const Getstream = require('../../../vendor/getstream');

const leaveGroupMember = async (req, res) => {
  const {userId} = req;
  const {channelId} = req.body;

  try {
    const response = await Getstream.chat.removeGroupMember(channelId, userId);
    const {channel, channelApiResponse} = response.data || {};

    let channelResponse;
    try {
      const {newChannelName, betterChannelMember, betterChannelMemberObject, updatedChannel} =
        await BetterSocialCore.chat.updateBetterChannelMembers(channel, channelApiResponse, true);

      await channel.sendMessage({
        text: 'Leave group',
        type: 'system',
        user_id: userId,
        userAffectedId: userId
      });

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

module.exports = leaveGroupMember;
