const {User, ChatAnonUserInfo} = require('../../databases/models');
const {StreamChat} = require('stream-chat');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {responseError, responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE} = require('../../helpers/constants');
const UsersFunction = require('../../databases/functions/users');
const Getstream = require('../../vendor/getstream');
const BetterSocialCore = require('../../services/bettersocial');

const {
  is_all_anon_user,
  handle_anon_to_anon_channel_owner,
  handle_anon_to_anon_channel_member
} = require('../../services/bettersocial/chat/allAnonChat');

const setNewStateMemberWithAnonInfo = (anon_user_info) => {
  let user = {
    name: `${anon_user_info.anon_user_info_color_name} ${anon_user_info.anon_user_info_emoji_name}`,
    username: `${anon_user_info.anon_user_info_color_name} ${anon_user_info.anon_user_info_emoji_name}`
  };
  return {
    anon_user_info_color_code: anon_user_info.anon_user_info_color_code,
    anon_user_info_color_name: anon_user_info.anon_user_info_color_name,
    anon_user_info_emoji_code: anon_user_info.anon_user_info_emoji_code,
    anon_user_info_emoji_name: anon_user_info.anon_user_info_emoji_name,
    user
  };
};

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
    anon_user_info_emoji_name,
    context = null
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
  ////////////////////////

  let prevTargetUser;
  if (
    oldChannelDetail &&
    oldChannelDetail[0] &&
    oldChannelDetail[0].data &&
    oldChannelDetail[0].data?.better_channel_member
  ) {
    prevTargetUser = Object.values(oldChannelDetail[0].data.better_channel_member).filter(
      (user) => user.user_id !== mySignedId
    )[0];
    targetUserId = prevTargetUser.user_id;
  } else {
    return res.status(404).json(responseError('Old channel id not found'));
  }

  // if (!prevTargetUser) {
  //   prevTargetUser = {
  //     user_id: targetUserId,
  //     anon_user_info_color_code: color.code,
  //     anon_user_info_color_name: color.color,
  //     anon_user_info_emoji_code: emoji.emoji,
  //     anon_user_info_emoji_name: emoji.name
  //   };
  // }
  // // prevent if anon user info is null
  // if (!prevTargetUser.anon_user_info_color_code || !prevTargetUser.anon_user_info_color_name) {
  //   prevTargetUser.anon_user_info_color_code = color.code;
  //   prevTargetUser.anon_user_info_color_name = color.color;
  // }
  // if (!prevTargetUser.anon_user_info_emoji_code || !prevTargetUser.anon_user_info_emoji_name) {
  //   prevTargetUser.anon_user_info_emoji_code = emoji.emoji;
  //   prevTargetUser.anon_user_info_emoji_name = emoji.name;
  // }

  // const detailPrevTargetUser = await UsersFunction.findUserById(User, targetUserId);
  // console.log('DEBUG detailPrevTargetUser XXX => ', detailPrevTargetUser);
  // console.log('DEBUG prevTargetUser XXX => ', prevTargetUser);

  try {
    /**
     * @type {import('stream-chat').OwnUserResponse}
     */
    const user = {
      name: `${anon_user_info_color_name} ${anon_user_info_emoji_name}`,
      id: req.userId,
      image: '',
      username: `${anon_user_info_color_name} ${anon_user_info_emoji_name}`
    };
    await client.connectUser(user, req.token);
    let is_anon_to_anon = await is_all_anon_user(members);

    let newChannel;
    let owner_anon_info;
    let member_anon_info;
    let newStateMemberWithAnonInfo = {};
    if (is_anon_to_anon) {
      // check if channel already exist
      owner_anon_info = await handle_anon_to_anon_channel_owner(req.userId, members[0], context);
      newStateMemberWithAnonInfo[req.userId] = setNewStateMemberWithAnonInfo(owner_anon_info);
      member_anon_info = await handle_anon_to_anon_channel_member(
        owner_anon_info,
        members[0],
        oldChannelId
      );
      newStateMemberWithAnonInfo[members[0]] = setNewStateMemberWithAnonInfo(member_anon_info);
      newChannel = client.channel('messaging', owner_anon_info.channel_id, {
        members
      });
    } else {
      newChannel = client.channel('messaging', {
        members
      });
    }

    // if (client.user.name !== `Anonymous ${anon_user_info_emoji_name}`) {
    //   await client.upsertUser({id: req.userId, name: `Anonymous ${anon_user_info_emoji_name}`});
    // }

    //set own user detail
    let checkChatAnonUserInfo = await ChatAnonUserInfo.findOne({
      where: {
        channel_id: oldChannelId,
        my_anon_user_id: req.userId,
        target_user_id: prevTargetUser.user_id,
        context: context,
        initiator: req.userId
      }
    });

    const createdChannel = await newChannel.create();
    if (!is_anon_to_anon) {
      newStateMemberWithAnonInfo = newChannel.state.members;
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
      } else {
        newStateMemberWithAnonInfo[req.userId].anon_user_info_color_code =
          anon_user_info_color_code;
        newStateMemberWithAnonInfo[req.userId].anon_user_info_color_name =
          anon_user_info_color_name;
        newStateMemberWithAnonInfo[req.userId].anon_user_info_emoji_code =
          anon_user_info_emoji_code;
        newStateMemberWithAnonInfo[req.userId].anon_user_info_emoji_name =
          anon_user_info_emoji_name;
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

    // get 100 messages
    const channelFilters = {cid: 'messaging:' + newChannel.id};
    const messageFilters = {created_at: {$lte: new Date()}};
    const messageHistory = await client.search(channelFilters, messageFilters, {
      sort: [{updated_at: -1}],
      limit: 100
    });
    const {betterChannelMember, betterChannelMemberObject, updatedChannel} =
      await BetterSocialCore.chat.updateBetterChannelMembers(newChannel, createdChannel, true, {
        channel_type: CHANNEL_TYPE.ANONYMOUS
      });

    await client.disconnectUser();
    const response = {
      ...updatedChannel,
      better_channel_members: betterChannelMember,
      better_channel_members_object: betterChannelMemberObject,
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
