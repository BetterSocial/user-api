const {StreamChat} = require('stream-chat');
const Environment = require('../../config/environment');
const {CHANNEL_TYPE, MESSAGE_TYPE} = require('../../helpers/constants');
const {v4: uuid} = require('uuid');
const UsersFunction = require('../../databases/functions/users');
const {responseError, responseSuccess} = require('../../utils/Responses');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {User, ChatAnonUserInfo} = require('../../databases/models');
const BetterSocialCore = require('../../services/bettersocial');
const {ErrorMessage} = require('../../helpers/message');
const {isChatToYourself} = require('../../helpers/isChatToYourself');

const initChatFromProfileAsAnonymousV2 = async (req, res) => {
  const {
    member,
    message,
    anon_user_info_color_code,
    anon_user_info_color_name,
    anon_user_info_emoji_code,
    anon_user_info_emoji_name
  } = req.body;

  let allowChat = await isChatToYourself(req.userId, member);
  if (!allowChat.success) {
    return ErrorResponse.e403(res, ErrorMessage.CANNOT_CHAT_SELF);
  }

  const members = [member, req.userId];

  const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRETƒ);
  try {
    /**
     * @type {import('stream-chat').OwnUserResponse}
     */
    const user = {
      name: `Anonymous ${anon_user_info_emoji_name}`,
      id: req.userId,
      image: '',
      username: `Anonymous ${anon_user_info_emoji_name}`
    };
    await client.connectUser(user, req.token);

    if (client.user.name !== `Anonymous ${anon_user_info_emoji_name}`) {
      await client.upsertUser({id: req.userId, name: `Anonymous ${anon_user_info_emoji_name}`});
    }

    const targetUserData = await UsersFunction.findUserById(User, member);

    const channel = client.channel('messaging', {members});
    const createdChannel = await channel.create();

    // Default mock chat in case of channel is blocked
    let chat = {
      message: {
        id: uuid(),
        cid: createdChannel?.channel?.id,
        message_type: MESSAGE_TYPE.REPLY_PROMPT,
        text: message,
        message,
        user: {
          id: req.userId,
          name: `Anonymous ${anon_user_info_emoji_name}`,
          image: '',
          username: `Anonymous ${anon_user_info_emoji_name}`
        },
        reply_data: {
          user: {
            id: member,
            name: targetUserData.username,
            image: targetUserData.profile_pic_path,
            username: targetUserData.username
          },
          message: targetUserData.bio
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    };

    const exist = await ChatAnonUserInfo.count({
      where: {
        channel_id: channel.id,
        my_anon_user_id: req.userId,
        target_user_id: member
      }
    });

    if (!exist) {
      await ChatAnonUserInfo.create({
        channel_id: channel.id,
        my_anon_user_id: req.userId,
        target_user_id: member,
        anon_user_info_color_code,
        anon_user_info_color_name,
        anon_user_info_emoji_code,
        anon_user_info_emoji_name
      });
    }

    const targetsUserModel = [targetUserData];
    targetsUserModel.push({
      user_id: req.userId,
      username: `Anonymous ${anon_user_info_emoji_name}`,
      profile_pic_path: '',
      anon_user_info_color_code,
      anon_user_info_color_name,
      anon_user_info_emoji_code,
      anon_user_info_emoji_name
    });

    const {betterChannelMember, betterChannelMemberObject} =
      await BetterSocialCore.chat.updateBetterChannelMembers(channel, createdChannel, true, {
        channel_type: CHANNEL_TYPE.ANONYMOUS,
        anon_user_info_color_code,
        anon_user_info_color_name,
        anon_user_info_emoji_code,
        anon_user_info_emoji_name
      });

    if (!createdChannel?.channel?.is_channel_blocked) {
      chat = await channel.sendMessage({
        user_id: req.userId,
        text: message,
        message_type: MESSAGE_TYPE.REPLY_PROMPT,
        members,
        message,
        reply_data: {
          user: {
            id: member,
            name: targetUserData.username,
            image: targetUserData.profile_pic_path,
            username: targetUserData.username
          },
          message: targetUserData.bio
        },
        anon_user_info_color_code,
        anon_user_info_color_name,
        anon_user_info_emoji_code,
        anon_user_info_emoji_name
      });
    }

    const response = {
      ...chat,
      members: targetsUserModel,
      better_channel_member: betterChannelMember,
      better_channel_member_object: betterChannelMemberObject
    };

    if (createdChannel?.channel?.is_channel_blocked) {
      return res.status(400).json(responseError(ErrorMessage.CHANNEL_BLOCKED, response));
    }

    return res.status(200).json(responseSuccess('sent', response));
  } catch (error) {
    console.log('Error', error);
    return ErrorResponse.e400(res, error.message);
  } finally {
    await client.disconnectUser();
  }
};

module.exports = initChatFromProfileAsAnonymousV2;
