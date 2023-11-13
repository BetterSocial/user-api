const {StreamChat} = require('stream-chat');
const {CHANNEL_TYPE_STRING, CHANNEL_TYPE} = require('../../helpers/constants');
const ErrorResponse = require('../../utils/response/ErrorResponse');

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

    const channel = client.channel(channelTypeString, {
      members
    });

    const findOrCreateChannel = await channel.create();
    const channelName = findOrCreateChannel.members.map((member) => member.user.name).join(', ');

    try {
      await channel.updatePartial({
        set: {
          channelType,
          channel_type: channelType,
          name: channelName
        }
      });
    } catch (e) {
      console.debug(e);
    }

    await client.disconnectUser();

    return res.status(200).json(findOrCreateChannel);
  } catch (error) {
    await client.disconnectUser();
    return ErrorResponse.e400(res, error.message);
  }
};

module.exports = findOrCreateChannelBySignedSender;
