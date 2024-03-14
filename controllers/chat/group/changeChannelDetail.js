const {StreamChat} = require('stream-chat');
const {CHANNEL_TYPE_STRING} = require('../../../helpers/constants');
const ErrorResponse = require('../../../utils/response/ErrorResponse');
const {ResponseSuccess} = require('../../../utils/Responses');
const UsersFunction = require('../../../databases/functions/users');
const {User} = require('../../../databases/models');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const changeChannelDetail = async (req, res) => {
  const {channel_id, channel_image, channel_name} = req.body;
  const {userId} = req;

  const ownUser = await UsersFunction.findUserById(User, userId);

  const client = new StreamChat(process.env.API_KEY, process.env.SECRET);
  const queriedChannel = await client.queryChannels({
    type: CHANNEL_TYPE_STRING.GROUP,
    id: channel_id,
    members: {$in: [userId]}
  });

  if (queriedChannel?.length < 1) return ErrorResponse.e404(res, 'Group not found');

  const channel = await client.channel(CHANNEL_TYPE_STRING.GROUP, channel_id);
  const updateData = {};
  if (channel_image) updateData.image = channel_image;
  if (channel_name) updateData.name = channel_name;

  try {
    const members = channel.data?.better_channel_member?.map((member) => member.user_id);

    if (channel_name) {
      const textOwnUser = `You changed the group name to "${channel_name}"`;
      const textTargetUser = `${ownUser.username} changed the group name to "${channel_name}"`;
      const textDefaultUser = `${ownUser.username} changed the group name to "${channel_name}"`;

      await channel.sendMessage({
        text: textDefaultUser,
        own_text: textOwnUser,
        other_text: textTargetUser,
        better_type: 'change_channel_detail',
        type: 'system',
        user_id: userId,
        only_to_user_show: userId,
        disable_to_user: false,
        is_from_prepopulated: true,
        system_user: userId,
        isSystem: true,
        members: members
      });
    }

    if (channel_image) {
      const textOwnUser = `You changed the group image`;
      const textTargetUser = `${ownUser.username} changed the group image`;
      const textOtherUser = `${ownUser.username} changed the group image`;

      await channel.sendMessage({
        text: textOtherUser,
        own_text: textOwnUser,
        other_text: textTargetUser,
        better_type: 'change_channel_detail',
        type: 'system',
        user_id: userId,
        system_user: userId,
        isSystem: true,
        members: members
      });
    }

    const response = await channel.updatePartial({
      set: {
        ...updateData,
        is_name_custom: true,
        is_image_custom: true
      }
    });

    return ResponseSuccess(res, 'Group has been updated', 200, response);
  } catch (e) {
    return ErrorResponse.e500(res, e.message);
  }
};

module.exports = changeChannelDetail;
