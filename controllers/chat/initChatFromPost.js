const {User} = require('../../databases/models');
const {StreamChat} = require('stream-chat');
const {v4: uuid} = require('uuid');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE} = require('../../helpers/constants');
const UsersFunction = require('../../databases/functions/users');
const Getstream = require('../../vendor/getstream');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const initChatFromPost = async (req, res) => {
  let {targetUserId, source, postId, commentId} = req.body;

  targetUserId = await Getstream.feed.getUserIdFromSource(res, source, {
    post_id: postId,
    comment_id: commentId,
    user_id: targetUserId
  });

  let members = [targetUserId];
  if (!members.includes(req.userId)) members.push(req.userId);

  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  try {
    const [userModel, targetUserModel] = await Promise.all([
      UsersFunction.findUserById(User, req?.userId),
      UsersFunction.findUserById(User, targetUserId)
    ]);
    /**
     * @type {import('stream-chat').OwnUserResponse}
     */
    const user = {
      name: userModel?.username,
      id: req.userId,
      image: userModel?.profile_pic_path,
      username: userModel?.username
    };

    await client.connectUser(user, req.token);

    const channel = client.channel('messaging', uuid(), {
      members
    });
    const createdChannel = await channel.create();

    try {
      if (!channel?.data?.name) {
        let channelType = CHANNEL_TYPE.CHAT;
        if (userModel.is_anonymous || targetUserModel.is_anonymous) {
          channelType = CHANNEL_TYPE.ANONYMOUS;
        }

        await channel.updatePartial({
          set: {
            channel_type: channelType,
            name: [userModel?.username, targetUserModel?.username].join(', ')
          }
        });
      }
    } catch (e) {
      console.log(e);
    }

    const response = {
      ...createdChannel,
      better_channel_members_object: channel.state.members,
      better_channel_members: Object.values(channel.state.members)
    };

    await client.disconnectUser();

    return res.status(200).json(responseSuccess('sent', response));
  } catch (error) {
    await client.disconnectUser();
    return ErrorResponse.e400(res, error.message);
  }
};

module.exports = initChatFromPost;
