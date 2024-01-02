const {User, ChatAnonUserInfo} = require('../../databases/models');
const {StreamChat} = require('stream-chat');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {responseError, responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE} = require('../../helpers/constants');
const UsersFunction = require('../../databases/functions/users');
const Getstream = require('../../vendor/getstream');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const moveToAnon = async (req, res) => {
  let {
    targetUserId,
    oldChannelId,
    source,
    postId,
    commentId,
    anon_user_info_color_code,
    anon_user_info_color_name,
    anon_user_info_emoji_code,
    anon_user_info_emoji_name
  } = req.body;

  targetUserId = await Getstream.feed.getUserIdFromSource(res, source, {
    post_id: postId,
    comment_id: commentId,
    user_id: targetUserId
  });

  let members = [targetUserId];
  if (!members.includes(req.userId)) members.push(req.userId);

  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);

  const filter = {id: oldChannelId};
  const sort = {last_message_at: -1};
  const oldChannelDetail = await client.queryChannels(filter, sort);
  //req.userId always anon since the token are using anon token
  const mySignedId = await UsersFunction.findSignedUserId(User, req.userId);
  const prevTargetUser = Object.values(oldChannelDetail[0].data.better_channel_member).filter(
    (user) => user.user_id !== mySignedId
  )[0];
  const detailPrevTargetUser = await UsersFunction.findUserById(User, prevTargetUser.user_id);

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

    //set target user detail
    newStateMemberWithAnonInfo[prevTargetUser.user_id].user = prevTargetUser.user;
    if (detailPrevTargetUser.is_anonymous) {
      newStateMemberWithAnonInfo[prevTargetUser.user_id].anon_user_info_color_code =
        prevTargetUser?.anon_user_info_color_code;
      newStateMemberWithAnonInfo[prevTargetUser.user_id].anon_user_info_color_name =
        prevTargetUser?.anon_user_info_color_name;
      newStateMemberWithAnonInfo[prevTargetUser.user_id].anon_user_info_emoji_code =
        prevTargetUser?.anon_user_info_emoji_code;
      newStateMemberWithAnonInfo[prevTargetUser.user_id].anon_user_info_emoji_name =
        prevTargetUser?.anon_user_info_emoji_name;

      await ChatAnonUserInfo.create({
        channel_id: newChannel.id,
        my_anon_user_id: req.userId,
        target_user_id: prevTargetUser.user_id,
        anon_user_info_color_code: prevTargetUser?.anon_user_info_color_code,
        anon_user_info_color_name: prevTargetUser?.anon_user_info_color_name,
        anon_user_info_emoji_code: prevTargetUser?.anon_user_info_emoji_code,
        anon_user_info_emoji_name: prevTargetUser?.anon_user_info_emoji_name
      });
    }

    //set own user detail
    let checkChatAnonUserInfo = await ChatAnonUserInfo.findOne({
      where: {
        channel_id: createdChannel?.channel?.id,
        my_anon_user_id: req.userId
      }
    });
    if (checkChatAnonUserInfo) {
      newStateMemberWithAnonInfo[req.userId].anon_user_info_color_code =
        checkChatAnonUserInfo?.anon_user_info_color_code;
      newStateMemberWithAnonInfo[req.userId].anon_user_info_color_name =
        checkChatAnonUserInfo?.anon_user_info_color_name;
      newStateMemberWithAnonInfo[req.userId].anon_user_info_emoji_code =
        checkChatAnonUserInfo?.anon_user_info_emoji_code;
      newStateMemberWithAnonInfo[req.userId].anon_user_info_emoji_name =
        checkChatAnonUserInfo?.anon_user_info_emoji_name;

      newStateMemberWithAnonInfo[req.userId].user.name =
        'Anonymous ' + checkChatAnonUserInfo?.anon_user_info_emoji_name;
      newStateMemberWithAnonInfo[req.userId].user.username =
        'Anonymous ' + checkChatAnonUserInfo?.anon_user_info_emoji_name;

      await ChatAnonUserInfo.create({
        channel_id: newChannel.id,
        my_anon_user_id: req.userId,
        target_user_id: prevTargetUser.user_id,
        anon_user_info_color_code: checkChatAnonUserInfo?.anon_user_info_color_code,
        anon_user_info_color_name: checkChatAnonUserInfo?.anon_user_info_color_name,
        anon_user_info_emoji_code: checkChatAnonUserInfo?.anon_user_info_emoji_code,
        anon_user_info_emoji_name: checkChatAnonUserInfo?.anon_user_info_emoji_name
      });
    } else {
      newStateMemberWithAnonInfo[req.userId].anon_user_info_color_code = anon_user_info_color_code;
      newStateMemberWithAnonInfo[req.userId].anon_user_info_color_name = anon_user_info_color_name;
      newStateMemberWithAnonInfo[req.userId].anon_user_info_emoji_code = anon_user_info_emoji_code;
      newStateMemberWithAnonInfo[req.userId].anon_user_info_emoji_name = anon_user_info_emoji_name;

      newStateMemberWithAnonInfo[req.userId].user.name = 'Anonymous ' + anon_user_info_emoji_name;
      newStateMemberWithAnonInfo[req.userId].user.username =
        'Anonymous ' + anon_user_info_emoji_name;

      await ChatAnonUserInfo.create({
        channel_id: newChannel.id,
        my_anon_user_id: req.userId,
        target_user_id: prevTargetUser.user_id,
        anon_user_info_color_code: anon_user_info_color_code,
        anon_user_info_color_name: anon_user_info_color_name,
        anon_user_info_emoji_code: anon_user_info_emoji_code,
        anon_user_info_emoji_name: anon_user_info_emoji_name
      });
    }

    try {
      let anonDetailInfo = {
        anon_user_info_color_code: newStateMemberWithAnonInfo[req.userId].anon_user_info_color_code,
        anon_user_info_color_name: newStateMemberWithAnonInfo[req.userId].anon_user_info_color_name,
        anon_user_info_emoji_code: newStateMemberWithAnonInfo[req.userId].anon_user_info_emoji_code,
        anon_user_info_emoji_name: newStateMemberWithAnonInfo[req.userId].anon_user_info_emoji_name
      };

      await newChannel.updatePartial({
        set: {
          channel_type: CHANNEL_TYPE.ANONYMOUS,
          ...anonDetailInfo,
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
