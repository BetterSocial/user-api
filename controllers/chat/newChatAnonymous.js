const {StreamChat} = require('stream-chat');
const Environment = require('../../config/environment');
const {CHANNEL_TYPE} = require('../../helpers/constants');
const UsersFunction = require('../../databases/functions/users');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {responseSuccess} = require('../../utils/Responses');
const {User, ChatAnonUserInfo} = require('../../databases/models');
const ChatAnonUserInfoFunction = require('../../databases/functions/chatAnonUserInfo');
const BetterSocialConstantListUtils = require('../../services/bettersocial/constantList/utils');
const {ErrorMessage} = require('../../helpers/message');

const updateChannelAnonUserInfo = (apiChannel, anonUserInfo) => {
  apiChannel.channel.anon_user_info_color_code = anonUserInfo.anon_user_info_color_code;
  apiChannel.channel.anon_user_info_color_name = anonUserInfo.anon_user_info_color_name;
  apiChannel.channel.anon_user_info_emoji_code = anonUserInfo.anon_user_info_emoji_code;
  apiChannel.channel.anon_user_info_emoji_name = anonUserInfo.anon_user_info_emoji_name;
  apiChannel.channel.channel_type = CHANNEL_TYPE.ANONYMOUS;
};

const newChatAnonymous = async (req, res) => {
  const {targetUserId} = req.body;
  if (targetUserId === req.userId) {
    return ErrorResponse.e403(res, ErrorMessage.CANNOT_CHAT_SELF);
  }
  let response = {};
  const members = [targetUserId, req.userId];
  const client = new StreamChat(Environment.GETSTREAM_API_KEY, Environment.GETSTREAM_API_SECRETƒ);
  const userModel = await UsersFunction.findUserById(User, req?.userId);
  const user = {
    name: userModel?.username,
    id: req.userId,
    image: userModel?.profile_pic_path,
    username: userModel?.username
  };
  await client.connectUser(user, req.token);
  try {
    // find exisiting channel
    const existingChannel = await ChatAnonUserInfoFunction.findExistingChannelForAnonUser(
      ChatAnonUserInfo,
      targetUserId,
      req.userId
    );
    console.log('existingChannel', existingChannel);
    // if exist then return the channel
    if (existingChannel) {
      response = {
        channel: existingChannel
      };
      const filter = {id: existingChannel.channel_id};
      const sort = [{last_message_at: -1}];

      const channels = await client.queryChannels(filter, sort);
      const getStreamChannel = channels.length > 0 ? channels[0] : null;

      response = {
        channel: getStreamChannel.data,
        messages: getStreamChannel.state.messages ? getStreamChannel.state.messages : [],
        pinned_messages: getStreamChannel.state.pinned_messages
          ? getStreamChannel.state.pinned_messages
          : [],
        members: getStreamChannel.state.members ? getStreamChannel.state.members : [],
        membership: getStreamChannel.state.membership ? getStreamChannel.state.membership : null,
        duration: getStreamChannel.state.duration ? getStreamChannel.state.duration : null,
        better_channel_members_object: getStreamChannel.state.members,
        better_channel_members: Object.values(getStreamChannel.state.members)
      };
    } else {
      // if channel not exist then create new channel
      const channel = client.channel('messaging', {
        members
      });
      console.log('channel', channel);
      const findOrCreateChannel = await channel.create();
      console.log('findOrCreateChannel', findOrCreateChannel);
      findOrCreateChannel.members = await Promise.all(
        findOrCreateChannel.members.map(async (member) => {
          if (member.role !== 'owner') return member;

          const anonInfo = await ChatAnonUserInfo.findOne({
            where: {
              channel_id: findOrCreateChannel.channel.id,
              my_anon_user_id: member.user_id
            }
          });

          let anonUserInfo = {};

          if (anonInfo) {
            anonUserInfo = anonInfo;
            updateChannelAnonUserInfo(findOrCreateChannel, anonUserInfo);
            return {
              ...member,
              anon_user_info_color_code: anonInfo.anon_user_info_color_code,
              anon_user_info_color_name: anonInfo.anon_user_info_color_name,
              anon_user_info_emoji_code: anonInfo.anon_user_info_emoji_code,
              anon_user_info_emoji_name: anonInfo.anon_user_info_emoji_name
            };
          }

          const emoji = BetterSocialConstantListUtils.getRandomEmoji();
          const color = BetterSocialConstantListUtils.getRandomColor();
          anonUserInfo = {
            anon_user_info_color_code: color.code,
            anon_user_info_color_name: color.color,
            anon_user_info_emoji_code: emoji.emoji,
            anon_user_info_emoji_name: emoji.name
          };

          updateChannelAnonUserInfo(findOrCreateChannel, anonUserInfo);
          await ChatAnonUserInfoFunction.createChatAnonUserInfo(
            ChatAnonUserInfo,
            findOrCreateChannel.channel.id,
            req?.userId,
            members[0],
            anonUserInfo
          );

          channel.updatePartial({
            set: {
              channel_type: CHANNEL_TYPE.ANONYMOUS,
              ...anonUserInfo
            }
          });

          return {
            ...member,
            anon_user_info_color_code: color.code,
            anon_user_info_color_name: color.color,
            anon_user_info_emoji_code: emoji.emoji,
            anon_user_info_emoji_name: emoji.name
          };
        })
      );
      response = {
        ...findOrCreateChannel,
        better_channel_members_object: findOrCreateChannel.members,
        better_channel_members: Object.values(findOrCreateChannel.members)
      };
    }

    return res.status(200).json(responseSuccess('sent', response));
  } catch (error) {
    return ErrorResponse.e400(res, error.message);
  } finally {
    await client.disconnectUser();
  }
};

module.exports = newChatAnonymous;
