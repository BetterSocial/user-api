const UsersFunction = require('../../databases/functions/users');
const {ResponseSuccess} = require('../../utils/Responses');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const GetstreamSingleton = require('../../vendor/getstream/singleton');
const {User} = require('../../databases/models');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
module.exports = async (req, res) => {
  const client = GetstreamSingleton.getChatInstance();
  const {user, userId} = req;
  const {channel_id, target_follow_user_id} = req?.body || {};

  try {
    const channels = await client.queryChannels({
      id: channel_id,
      type: 'messaging'
    });

    if (channels?.length === 0) {
      return ErrorResponse.e404(res, 'Channel not found');
    }

    const channel = channels[0];

    if (!channel.state.members[target_follow_user_id]) {
      return ErrorResponse.e404(res, 'User is not a member of this channel');
    }

    const targetUser = await UsersFunction.findUserById(User, target_follow_user_id);
    if (!targetUser) {
      return ErrorResponse.e404(res, 'User not found');
    }

    channel.sendMessage(
      {
        text: `${user?.username} started following you. Send them a message now`,
        user_id: 'system',
        system_user: userId,
        type: 'system',
        other_text: `You started following ${targetUser?.username}. Send them a message now.`
      },
      {
        skip_push: true
      }
    );

    ResponseSuccess(res, 'Message sent', 200);
  } catch (e) {
    console.log('Error sending message', e);
    ErrorResponse.e404(res, 'Channel not found');
  } finally {
    client.disconnectUser();
  }
};
