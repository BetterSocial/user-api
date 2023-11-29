const BetterSocialCore = require('../../../services/bettersocial');
const {ResponseSuccess} = require('../../../utils/Responses');
const ErrorResponse = require('../../../utils/response/ErrorResponse');
const Getstream = require('../../../vendor/getstream');

const removeGroupMember = async (req, res) => {
  const {userId} = req;
  const {channelId, targetUserId} = req.body;

  try {
    const response = await Getstream.chat.removeGroupMember(channelId, userId, targetUserId);
    const {channel, channelApiResponse} = response.data || {};

    try {
      const {newChannelName, betterChannelMember, betterChannelMemberObject} =
        await BetterSocialCore.chat.updateBetterChannelMembers(channel, channelApiResponse, true);

      channelApiResponse.channel.name = newChannelName;
      channelApiResponse.channel.better_channel_member = betterChannelMember;
      channelApiResponse.channel.better_channel_member_object = betterChannelMemberObject;
    } catch (e) {
      console.log(e);
    }

    return ResponseSuccess(res, response?.message, 200, channelApiResponse);
  } catch (e) {
    return ErrorResponse.e500(res, e.message);
  }
};

module.exports = removeGroupMember;
