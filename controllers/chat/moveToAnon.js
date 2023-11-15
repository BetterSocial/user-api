const {User, ChatAnonUserInfo} = require('../../databases/models');
const {StreamChat} = require('stream-chat');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {responseError, responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE} = require('../../helpers/constants');
const UsersFunction = require('../../databases/functions/users');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const moveToAnon = async (req, res) => {
  const {
    targetUser,
    oldChannelId,
    anon_user_info_color_code,
    anon_user_info_color_name,
    anon_user_info_emoji_code,
    anon_user_info_emoji_name
  } = req.body;

  let members = [targetUser];
  if (!members.includes(req.userId)) members.push(req.userId);

  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
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

    const newChannel = client.channel('messaging', {members});
    const createdChannel = await newChannel.create();

    const targets = members.filter((member) => member !== req.userId);
    await targets.map(async (target) => {
      const userModel = await UsersFunction.findUserById(User, target);

      if (userModel.is_anonymous) {
        const checkChatAnonUserInfo = await ChatAnonUserInfo.findOne({
          where: {
            channel_id: oldChannelId,
            my_anon_user_id: req.userId,
            target_user_id: target
          }
        });

        if (checkChatAnonUserInfo === null) {
          await ChatAnonUserInfo.create({
            channel_id: newChannel.id,
            my_anon_user_id: req.userId,
            target_user_id: target,
            anon_user_info_color_code:
              checkChatAnonUserInfo?.anon_user_info_color_code || anon_user_info_color_code,
            anon_user_info_color_name:
              checkChatAnonUserInfo?.anon_user_info_color_name || anon_user_info_color_name,
            anon_user_info_emoji_code:
              checkChatAnonUserInfo?.anon_user_info_emoji_code || anon_user_info_emoji_code,
            anon_user_info_emoji_name:
              checkChatAnonUserInfo?.anon_user_info_emoji_name || anon_user_info_emoji_name
          });
        }
      }
    });

    try {
      await newChannel.updatePartial({
        set: {
          channel_type: CHANNEL_TYPE.ANONYMOUS,
          anon_user_info_color_code,
          anon_user_info_color_name,
          anon_user_info_emoji_code,
          anon_user_info_emoji_name,
          better_channel_member: newChannel.state.members
        }
      });
    } catch (e) {
      console.log(e);
    }

    const targetsUserModel = await UsersFunction.findMultipleUsersById(User, targets);
    targetsUserModel.push({
      user_id: req.userId,
      username: `Anonymous ${anon_user_info_emoji_name}`,
      profile_pic_path: '',
      anon_user_info_color_code,
      anon_user_info_color_name,
      anon_user_info_emoji_code,
      anon_user_info_emoji_name
    });

    // get 100 messages
    const channelFilters = {cid: 'messaging:' + newChannel.id};
    const messageFilters = {created_at: {$lte: new Date()}};
    const messageHistory = await client.search(channelFilters, messageFilters, {
      sort: [{updated_at: -1}],
      limit: 100
    });

    await client.disconnectUser();

    const response = {
      channel: createdChannel,
      members: targetsUserModel,
      messageHistory: messageHistory.results
    };

    if (createdChannel?.channel?.is_channel_blocked) {
      return res.status(400).json(responseError('Channel is blocked', response));
    }

    return res.status(200).json(responseSuccess('sent', response));
  } catch (error) {
    await client.disconnectUser();
    return ErrorResponse.e400(res, error.message);
  }
};

module.exports = moveToAnon;
