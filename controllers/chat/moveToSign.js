const {User, ChatAnonUserInfo} = require('../../databases/models');
const {StreamChat} = require('stream-chat');
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
const moveToSign = async (req, res) => {
  let {targetUserId, oldChannelId, source, postId, commentId} = req.body;

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
      id: req?.userId,
      image: userModel?.profile_pic_path,
      username: userModel?.username
    };

    await client.connectUser(user, req.token);

    const newChannel = client.channel('messaging', {members});
    const createdChannel = await newChannel.create();
    let newStateMemberWithAnonInfo = newChannel.state.members;
    let isContainAnonimous = false;

    await Promise.all(
      members.map(async (member) => {
        const userModel = await UsersFunction.findUserById(User, member);

        if (userModel.is_anonymous) {
          isContainAnonimous = true;

          const checkChatAnonUserInfo = await ChatAnonUserInfo.findOne({
            where: {
              channel_id: oldChannelId,
              my_anon_user_id: member,
              target_user_id: targetUserId
            }
          });

          if (checkChatAnonUserInfo !== null) {
            let new_anon_user_info_color_code = checkChatAnonUserInfo?.anon_user_info_color_code;
            let new_anon_user_info_color_name = checkChatAnonUserInfo?.anon_user_info_color_name;
            let new_anon_user_info_emoji_code = checkChatAnonUserInfo?.anon_user_info_emoji_code;
            let new_anon_user_info_emoji_name = checkChatAnonUserInfo?.anon_user_info_emoji_name;

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

    const oldChannelName = createdChannel?.channel?.name?.trim();

    try {
      if (!oldChannelName || oldChannelName === ',') {
        const newChannelName = [userModel?.username, targetUserModel?.username].join(', ');
        createdChannel.channel.name = newChannelName;
        await newChannel.updatePartial({
          set: {
            channel_type: isContainAnonimous ? CHANNEL_TYPE.ANONYMOUS : CHANNEL_TYPE.CHAT,
            name: newChannelName,
            better_channel_member: newStateMemberWithAnonInfo
          }
        });
      }
    } catch (e) {
      console.log(e);
    }

    // get 100 messages
    const channelFilters = {cid: 'messaging:' + newChannel.id};
    const messageFilters = {created_at: {$lte: new Date()}};
    const messageHistory = await client.search(channelFilters, messageFilters, {
      sort: [{updated_at: -1}],
      limit: 100
    });

    const response = {
      ...createdChannel,
      better_channel_members_object: newStateMemberWithAnonInfo,
      better_channel_members: Object.values(newStateMemberWithAnonInfo),
      messageHistories: messageHistory.results
    };

    await client.disconnectUser();

    return res.status(200).json(responseSuccess('sent', response));
  } catch (error) {
    await client.disconnectUser();
    return ErrorResponse.e400(res, error.message);
  }
};

module.exports = moveToSign;
