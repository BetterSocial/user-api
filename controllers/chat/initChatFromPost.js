const {User, PostAnonUserInfo, ChatAnonUserInfo} = require('../../databases/models');
const {StreamChat} = require('stream-chat');
const {v4: uuid} = require('uuid');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE} = require('../../helpers/constants');
const UsersFunction = require('../../databases/functions/users');
const Getstream = require('../../vendor/getstream');
const BetterSocialConstantListUtils = require('../../services/bettersocial/constantList/utils');
const PostAnonUserInfoFunction = require('../../databases/functions/postAnonUserInfo');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const initChatFromPost = async (req, res) => {
  let {targetUserId, source, postId, commentId} = req.body;

  try {
    targetUserId = await Getstream.feed.getUserIdFromSource(res, source, {
      post_id: postId,
      comment_id: commentId,
      user_id: targetUserId
    });
  } catch (error) {
    console.log(error);
    return;
  }

  let members = [targetUserId];
  if (!members.includes(req.userId)) members.push(req.userId);

  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  try {
    const [userModel, targetUserModel, emoji, color] = await Promise.all([
      UsersFunction.findUserById(User, req?.userId),
      UsersFunction.findUserById(User, targetUserId),
      BetterSocialConstantListUtils.getRandomEmoji(),
      BetterSocialConstantListUtils.getRandomColor()
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

    const newChannel = client.channel('messaging', uuid(), {
      members
    });
    await newChannel.create();
    let newStateMemberWithAnonInfo = newChannel.state.members;

    //Add anon info to channel
    if (targetUserModel.is_anonymous) {
      let anon_user_info = {};
      if (source === 'post') {
        const postAnonUserInfo = await PostAnonUserInfoFunction.checkSelfUsernameInPost(
          PostAnonUserInfo,
          User,
          {
            postId: postId,
            userId: targetUserModel.user_id
          },
          null,
          true
        );

        anon_user_info = {
          anon_user_info_color_code: postAnonUserInfo?.anon_user_info_color_code,
          anon_user_info_color_name: postAnonUserInfo?.anon_user_info_color_name,
          anon_user_info_emoji_code: postAnonUserInfo?.anon_user_info_emoji_code,
          anon_user_info_emoji_name: postAnonUserInfo?.anon_user_info_emoji_name
        };
      } else if (source === 'comment') {
        const reaction = await Getstream.feed.getReactionById(commentId);
        anon_user_info = {
          anon_user_info_color_code: reaction?.data.anon_user_info_color_code,
          anon_user_info_color_name: reaction?.data.anon_user_info_color_name,
          anon_user_info_emoji_code: reaction?.data.anon_user_info_emoji_code,
          anon_user_info_emoji_name: reaction?.data.anon_user_info_emoji_name
        };
      }

      newStateMemberWithAnonInfo[targetUserModel.user_id].anon_user_info_color_code =
        anon_user_info?.anon_user_info_color_code;
      newStateMemberWithAnonInfo[targetUserModel.user_id].anon_user_info_color_name =
        anon_user_info?.anon_user_info_color_name;
      newStateMemberWithAnonInfo[targetUserModel.user_id].anon_user_info_emoji_code =
        anon_user_info?.anon_user_info_emoji_code;
      newStateMemberWithAnonInfo[targetUserModel.user_id].anon_user_info_emoji_name =
        anon_user_info?.anon_user_info_emoji_name;

      newStateMemberWithAnonInfo[targetUserModel.user_id].user.name =
        'Anonymous ' + anon_user_info?.anon_user_info_emoji_name;
      newStateMemberWithAnonInfo[targetUserModel.user_id].user.username =
        'Anonymous ' + anon_user_info?.anon_user_info_emoji_name;

      await ChatAnonUserInfo.create({
        channel_id: newChannel.id,
        my_anon_user_id: userModel.user_id,
        target_user_id: targetUserModel.user_id,
        anon_user_info_color_code: anon_user_info?.anon_user_info_color_code,
        anon_user_info_color_name: anon_user_info?.anon_user_info_color_name,
        anon_user_info_emoji_code: anon_user_info?.anon_user_info_emoji_code,
        anon_user_info_emoji_name: anon_user_info?.anon_user_info_emoji_name
      });
    }

    if (userModel.is_anonymous) {
      newStateMemberWithAnonInfo[userModel.user_id].anon_user_info_color_code = color.code;
      newStateMemberWithAnonInfo[userModel.user_id].anon_user_info_color_name = color.color;
      newStateMemberWithAnonInfo[userModel.user_id].anon_user_info_emoji_code = emoji.emoji;
      newStateMemberWithAnonInfo[userModel.user_id].anon_user_info_emoji_name = emoji.name;

      newStateMemberWithAnonInfo[userModel.user_id].user.name = 'Anonymous ' + emoji.name;
      newStateMemberWithAnonInfo[userModel.user_id].user.username = 'Anonymous ' + emoji.name;

      await ChatAnonUserInfo.create({
        channel_id: newChannel.id,
        my_anon_user_id: userModel.user_id,
        target_user_id: targetUserModel.user_id,
        anon_user_info_color_code: color.code,
        anon_user_info_color_name: color.color,
        anon_user_info_emoji_code: emoji.emoji,
        anon_user_info_emoji_name: emoji.name
      });
    }
    //end add anon info to channel

    try {
      if (!newChannel?.data?.name) {
        let channelType = CHANNEL_TYPE.CHAT;
        let anonDetailInfo = {};
        if (userModel.is_anonymous) {
          channelType = CHANNEL_TYPE.ANONYMOUS;
          anonDetailInfo = {
            anon_user_info_color_code:
              newStateMemberWithAnonInfo[userModel.user_id].anon_user_info_color_code,
            anon_user_info_color_name:
              newStateMemberWithAnonInfo[userModel.user_id].anon_user_info_color_name,
            anon_user_info_emoji_code:
              newStateMemberWithAnonInfo[userModel.user_id].anon_user_info_emoji_code,
            anon_user_info_emoji_name:
              newStateMemberWithAnonInfo[userModel.user_id].anon_user_info_emoji_name
          };
        }

        if (targetUserModel.is_anonymous && !userModel.is_anonymous) {
          anonDetailInfo = {
            anon_user_info_color_code:
              newStateMemberWithAnonInfo[targetUserModel.user_id].anon_user_info_color_code,
            anon_user_info_color_name:
              newStateMemberWithAnonInfo[targetUserModel.user_id].anon_user_info_color_name,
            anon_user_info_emoji_code:
              newStateMemberWithAnonInfo[targetUserModel.user_id].anon_user_info_emoji_code,
            anon_user_info_emoji_name:
              newStateMemberWithAnonInfo[targetUserModel.user_id].anon_user_info_emoji_name
          };
        }

        await newChannel.updatePartial({
          set: {
            channel_type: channelType,
            name: [userModel?.username, targetUserModel?.username].join(', '),
            ...anonDetailInfo,
            better_channel_member: newStateMemberWithAnonInfo
          }
        });
      }
    } catch (e) {
      console.log(e);
    }

    const channelState = await newChannel.watch();

    const response = {
      ...channelState,
      better_channel_members: Object.values(channelState.channel.better_channel_member),
      better_channel_members_objet: channelState.channel.better_channel_member,
      messageHistories: []
    };

    await newChannel.stopWatching();

    await client.disconnectUser();

    return res.status(200).json(responseSuccess('sent', response));
  } catch (error) {
    await client.disconnectUser();
    return ErrorResponse.e400(res, error.message);
  }
};

module.exports = initChatFromPost;
