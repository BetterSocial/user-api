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
    targetUserId,
    oldChannelId,
    anon_user_info_color_code,
    anon_user_info_color_name,
    anon_user_info_emoji_code,
    anon_user_info_emoji_name
  } = req.body;

  let members = [targetUserId];
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
    let newStateMemberWithAnonInfo = newChannel.state.members;

    await Promise.all(
      members.map(async (member) => {
        const userModel = await UsersFunction.findUserById(User, member);

        if (userModel.is_anonymous) {
          let checkChatAnonUserInfo = await ChatAnonUserInfo.findOne({
            where: {
              channel_id: oldChannelId,
              my_anon_user_id: member,
              target_user_id: targetUserId
            }
          });

          if (checkChatAnonUserInfo === null) {
            checkChatAnonUserInfo = await ChatAnonUserInfo.findOne({
              where: {
                channel_id: createdChannel?.channel?.id,
                my_anon_user_id: member,
                target_user_id: targetUserId
              }
            });
          }

          newStateMemberWithAnonInfo[member].anon_user_info_color_code = anon_user_info_color_code;
          newStateMemberWithAnonInfo[member].anon_user_info_color_name = anon_user_info_color_name;
          newStateMemberWithAnonInfo[member].anon_user_info_emoji_code = anon_user_info_emoji_code;
          newStateMemberWithAnonInfo[member].anon_user_info_emoji_name = anon_user_info_emoji_name;

          if (checkChatAnonUserInfo !== null) {
            let new_anon_user_info_color_code =
              checkChatAnonUserInfo?.anon_user_info_color_code || anon_user_info_color_code;
            let new_anon_user_info_color_name =
              checkChatAnonUserInfo?.anon_user_info_color_name || anon_user_info_color_name;
            let new_anon_user_info_emoji_code =
              checkChatAnonUserInfo?.anon_user_info_emoji_code || anon_user_info_emoji_code;
            let new_anon_user_info_emoji_name =
              checkChatAnonUserInfo?.anon_user_info_emoji_name || anon_user_info_emoji_name;

            newStateMemberWithAnonInfo[member].anon_user_info_color_code =
              new_anon_user_info_color_code;
            newStateMemberWithAnonInfo[member].anon_user_info_color_name =
              new_anon_user_info_color_name;
            newStateMemberWithAnonInfo[member].anon_user_info_emoji_code =
              new_anon_user_info_emoji_code;
            newStateMemberWithAnonInfo[member].anon_user_info_emoji_name =
              new_anon_user_info_emoji_name;

            await ChatAnonUserInfo.create({
              channel_id: newChannel.id,
              my_anon_user_id: member,
              target_user_id: targetUserId,
              anon_user_info_color_code: new_anon_user_info_color_code,
              anon_user_info_color_name: new_anon_user_info_color_name,
              anon_user_info_emoji_code: new_anon_user_info_emoji_code,
              anon_user_info_emoji_name: new_anon_user_info_emoji_name
            });
          }
        }
      })
    );

    try {
      await newChannel.updatePartial({
        set: {
          channel_type: CHANNEL_TYPE.ANONYMOUS,
          anon_user_info_color_code,
          anon_user_info_color_name,
          anon_user_info_emoji_code,
          anon_user_info_emoji_name,
          better_channel_member: newStateMemberWithAnonInfo
        }
      });
    } catch (e) {
      console.log(e);
    }

    const targetsUserModel = await UsersFunction.findMultipleUsersById(User, members);
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
      ...createdChannel,
      better_channel_members: Object.values(newStateMemberWithAnonInfo),
      better_channel_members_objet: newStateMemberWithAnonInfo,
      messageHistories: messageHistory.results
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
