const {StreamChat} = require('stream-chat');
const {CHANNEL_TYPE_STRING} = require('../../helpers/constants');
const ErrorResponse = require('../../utils/response/ErrorResponse');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const changeChannelDetail = async (req, res) => {
  const {channel_id, channel_image, channel_name} = req.body;
  const {userId} = req;

  const client = new StreamChat(process.env.API_KEY, process.env.SECRET);
  const queriedChannel = await client.queryChannels({
    type: CHANNEL_TYPE_STRING.GROUP,
    id: channel_id,
    members: {$in: [userId]}
  });

  if (queriedChannel?.length < 1) return ErrorResponse.e404(res, 'Channel not found');

  const channel = await client.channel(CHANNEL_TYPE_STRING.GROUP, channel_id);
  const updateData = {};
  if (channel_image) updateData.image = channel_image;
  if (channel_name) updateData.name = channel_name;

  try {
    await channel.updatePartial({
      set: {
        ...updateData
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Channel updated'
    });
  } catch (e) {
    return ErrorResponse.e500(res, e.message);
  }
};

module.exports = changeChannelDetail;
