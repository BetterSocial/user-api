const {StreamChat} = require('stream-chat');

const Environment = require('../../config/environment');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const UsersFunction = require('../../databases/functions/users');
const {CHANNEL_TYPE, MESSAGE_TYPE} = require('../../helpers/constants');
const {User} = require('../../databases/models');
const {responseSuccess} = require('../../utils/Responses');
const BetterSocialCore = require('../../services/bettersocial');
const {ErrorMessage} = require('../../helpers/message');

const initChatFromProfileAsSignedV2 = async (req, res) => {
  const {member, message} = req.body;
  if (member === req.userId) {
    return ErrorResponse.e403(res, ErrorMessage.CANNOT_CHAT_SELF);
  }

  const members = [member, req.userId];

  const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRET);
  try {
    const userModel = await UsersFunction.findUserById(User, req?.userId);
    const targetUserModel = await UsersFunction.findUserById(User, member);
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

    const channel = client.channel('messaging', {members});

    const createdChannel = await channel.create();
    try {
      if (!channel?.data?.name) {
        await channel.updatePartial({
          set: {
            channel_type: CHANNEL_TYPE.CHAT,
            name: [userModel?.username, targetUserModel?.username].join(', ')
          }
        });
      }
    } catch (e) {
      console.log(e);
    }

    const chat = await channel.sendMessage({
      user_id: req.userId,
      text: message,
      message_type: MESSAGE_TYPE.REPLY_PROMPT,
      members,
      message,
      reply_data: {
        user: {
          id: member,
          name: targetUserModel.username,
          image: targetUserModel.profile_pic_path,
          username: targetUserModel.username
        },
        message: targetUserModel.bio
      }
    });

    const {betterChannelMember, betterChannelMemberObject} =
      await BetterSocialCore.chat.updateBetterChannelMembers(channel, createdChannel, true);

    const response = {
      ...chat,
      members: [userModel, targetUserModel],
      better_channel_member: betterChannelMember,
      better_channel_member_object: betterChannelMemberObject
    };

    await client.disconnectUser();

    return res.status(200).json(responseSuccess('sent', response));
  } catch (error) {
    await client.disconnectUser();
    return ErrorResponse.e400(res, error.message);
  }
};

module.exports = initChatFromProfileAsSignedV2;
