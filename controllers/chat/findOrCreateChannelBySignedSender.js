const {StreamChat} = require('stream-chat');
const {CHANNEL_TYPE_STRING, CHANNEL_TYPE} = require('../../helpers/constants');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {v4: uuid} = require('uuid');
const BetterSocialCore = require('../../services/bettersocial');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const findOrCreateChannelBySignedSender = async (req, res) => {
  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  const {members} = req.body;

  try {
    if (!members.includes(req.userId)) members.push(req.userId);

    if (members.length < 2) return ErrorResponse.e400(res, 'Members must be more than 1');

    await client.connectUser({id: req.userId}, req.token);

    const channelTypeString =
      members.length > 2 ? CHANNEL_TYPE_STRING.GROUP : CHANNEL_TYPE_STRING.CHAT;
    const channelType = members.length > 2 ? CHANNEL_TYPE.GROUP : CHANNEL_TYPE.CHAT;

    const queriedChannel = await client.queryChannels({
      type: channelTypeString,
      members: {$eq: members}
    });

    let channel;
    if (channelTypeString === CHANNEL_TYPE_STRING.GROUP) {
      // This will always create new group
      channel = client.channel(channelTypeString, uuid(), {
        members
      });
    } else if (channelTypeString === CHANNEL_TYPE_STRING.CHAT) {
      if (queriedChannel?.length > 0) {
        channel = client.channel(channelTypeString, queriedChannel[0].id);
      } else {
        channel = client.channel(channelTypeString, {
          members
        });
      }
    }

    const shouldBetterChannelMembersUpdated = channelType !== CHANNEL_TYPE.GROUP;
    const findOrCreateChannel = await channel.create();
    const {betterChannelMember, newChannelName, betterChannelMemberObject, updatedChannel} =
      await BetterSocialCore.chat.updateBetterChannelMembers(
        channel,
        findOrCreateChannel,
        shouldBetterChannelMembersUpdated,
        {
          channelType,
          channel_type: channelType
        }
      );

    findOrCreateChannel.channel.name = newChannelName;

    return res.status(200).json({
      ...updatedChannel,
      better_channel_member: betterChannelMember,
      better_channel_member_object: betterChannelMemberObject
    });
  } catch (error) {
    return ErrorResponse.e400(res, error.message);
  } finally {
    client.disconnectUser();
  }
};

module.exports = findOrCreateChannelBySignedSender;
