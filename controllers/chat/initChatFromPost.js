const {User, ChatAnonUserInfo} = require('../../databases/models');
const {StreamChat} = require('stream-chat');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE} = require('../../helpers/constants');
const UsersFunction = require('../../databases/functions/users');
const Getstream = require('../../vendor/getstream');
const BetterSocialConstantListUtils = require('../../services/bettersocial/constantList/utils');
const BetterSocialCore = require('../../services/bettersocial');
const {generate_channel_id_for_anon_chat} = require('../../services/bettersocial/chat/allAnonChat');

const get_anon_info_from_comment_post = async (client, userModel, source_id) => {
  let comment_data = null;
  let post_detail = await Getstream.feed.getPlainFeedById(source_id, {
    withOwnReactions: true
  });
  let comments = post_detail?.own_reactions?.comment;
  // iterate comments
  if (comments) {
    for (const element of comments) {
      let comment = element;
      if (comment.user_id === userModel.user_id) {
        comment_data = comment;
        break;
      }
    }
  }

  if (!comment_data) {
    const emoji = BetterSocialConstantListUtils.getRandomEmoji();
    const color = BetterSocialConstantListUtils.getRandomColor();
    comment_data = {
      anon_user_info_color_code: color.code,
      anon_user_info_color_name: color.color,
      anon_user_info_emoji_code: emoji.emoji,
      anon_user_info_emoji_name: emoji.name
    };
  } else {
    comment_data = {
      anon_user_info_color_code: comment_data?.data?.anon_user_info_color_code,
      anon_user_info_color_name: comment_data?.data?.anon_user_info_color_name,
      anon_user_info_emoji_code: comment_data?.data?.anon_user_info_emoji_code,
      anon_user_info_emoji_name: comment_data?.data?.anon_user_info_emoji_name
    };
  }

  return comment_data;
};

const sign_to_anon_post = async (
  client,
  userModel,
  targetUserModel,
  source_id,
  anonUserInfoFromPost
) => {
  let channel = await ChatAnonUserInfo.findOne({
    where: {
      my_anon_user_id: targetUserModel.user_id,
      target_user_id: userModel.user_id,
      context: 'post',
      initiator: userModel.user_id,
      source_id: source_id
    }
  });
  if (channel) {
    return channel;
  } else {
    let channel_id = generate_channel_id_for_anon_chat(
      targetUserModel.user_id,
      userModel.user_id,
      'post',
      source_id
    );
    let new_channel = await ChatAnonUserInfo.create({
      channel_id: channel_id,
      my_anon_user_id: targetUserModel.user_id,
      target_user_id: userModel.user_id,
      anon_user_info_color_code: anonUserInfoFromPost.anon_user_info_color_code,
      anon_user_info_color_name: anonUserInfoFromPost.anon_user_info_color_name,
      anon_user_info_emoji_code: anonUserInfoFromPost.anon_user_info_emoji_code,
      anon_user_info_emoji_name: anonUserInfoFromPost.anon_user_info_emoji_name,
      context: 'post',
      source_id: source_id,
      initiator: userModel.user_id
    });
    return new_channel;
  }
};

const anon_to_sign_post = async (client, userModel, targetUserModel, source_id) => {
  let channel = await ChatAnonUserInfo.findOne({
    where: {
      my_anon_user_id: userModel.user_id,
      target_user_id: targetUserModel.user_id,
      context: 'post',
      initiator: userModel.user_id
    }
  });
  if (channel) {
    return channel;
  } else {
    let channel_id = generate_channel_id_for_anon_chat(
      userModel.user_id,
      targetUserModel.user_id,
      'post',
      source_id
    );
    let anon_init_data = await get_anon_info_from_comment_post(client, userModel, source_id);

    let new_channel = await ChatAnonUserInfo.create({
      channel_id: channel_id,
      my_anon_user_id: userModel.user_id,
      target_user_id: targetUserModel.user_id,
      anon_user_info_color_code: anon_init_data.anon_user_info_color_code,
      anon_user_info_color_name: anon_init_data.anon_user_info_color_name,
      anon_user_info_emoji_code: anon_init_data.anon_user_info_emoji_code,
      anon_user_info_emoji_name: anon_init_data.anon_user_info_emoji_name,
      context: 'post',
      source_id: source_id,
      initiator: userModel.user_id
    });
    return new_channel;
  }
};
const anon_to_anon_post = async (
  client,
  userModel,
  targetUserModel,
  source_id,
  anonUserInfoFromPost
) => {
  let channel = await ChatAnonUserInfo.findOne({
    where: {
      my_anon_user_id: userModel.user_id,
      target_user_id: targetUserModel.user_id,
      context: 'post',
      source_id: source_id
    }
  });
  if (channel) {
    return channel;
  } else {
    // create owner anon info
    let channel_id = generate_channel_id_for_anon_chat(
      userModel.user_id,
      targetUserModel.user_id,
      'post',
      source_id
    );
    let anon_init_data = await get_anon_info_from_comment_post(client, userModel, source_id);
    let new_channel = await ChatAnonUserInfo.create({
      channel_id: channel_id,
      my_anon_user_id: userModel.user_id,
      target_user_id: targetUserModel.user_id,
      anon_user_info_color_code: anon_init_data.anon_user_info_color_code,
      anon_user_info_color_name: anon_init_data.anon_user_info_color_name,
      anon_user_info_emoji_code: anon_init_data.anon_user_info_emoji_code,
      anon_user_info_emoji_name: anon_init_data.anon_user_info_emoji_name,
      context: 'post',
      source_id: source_id,
      initiator: userModel.user_id
    });

    // create member anon info
    await ChatAnonUserInfo.create({
      channel_id: channel_id,
      my_anon_user_id: targetUserModel.user_id,
      target_user_id: userModel.user_id,
      anon_user_info_color_code: anonUserInfoFromPost.anon_user_info_color_code,
      anon_user_info_color_name: anonUserInfoFromPost.anon_user_info_color_name,
      anon_user_info_emoji_code: anonUserInfoFromPost.anon_user_info_emoji_code,
      anon_user_info_emoji_name: anonUserInfoFromPost.anon_user_info_emoji_name,
      context: 'post',
      source_id: source_id,
      initiator: userModel.user_id
    });

    return new_channel;
  }
};

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
    // check if the channel already exists
    let newChannel;
    let source_id = postId;
    let channel_type = CHANNEL_TYPE.CHAT;
    let channel_info;
    if (!userModel.is_anonymous && !targetUserModel.is_anonymous) {
      newChannel = client.channel('messaging', {
        members
      });
    } else {
      let anonUserInfoFromSouce = {};
      channel_type = CHANNEL_TYPE.ANONYMOUS;
      if (targetUserModel.is_anonymous) {
        if (source === 'post') {
          let anon_post_detail = await Getstream.feed.getPlainFeedById(postId);
          anonUserInfoFromSouce = {
            anon_user_info_color_code: anon_post_detail.anon_user_info_color_code,
            anon_user_info_color_name: anon_post_detail.anon_user_info_color_name,
            anon_user_info_emoji_code: anon_post_detail.anon_user_info_emoji_code,
            anon_user_info_emoji_name: anon_post_detail.anon_user_info_emoji_name
          };
        } else {
          let anon_comment_detail = await Getstream.feed.getReactionById(commentId);
          anonUserInfoFromSouce = {
            anon_user_info_color_code: anon_comment_detail.data.anon_user_info_color_code,
            anon_user_info_color_name: anon_comment_detail.data.anon_user_info_color_name,
            anon_user_info_emoji_code: anon_comment_detail.data.anon_user_info_emoji_code,
            anon_user_info_emoji_name: anon_comment_detail.data.anon_user_info_emoji_name
          };
        }
      }

      if (userModel.is_anonymous && !targetUserModel.is_anonymous) {
        channel_info = await anon_to_sign_post(client, userModel, targetUserModel, source_id);
      } else if (!userModel.is_anonymous && targetUserModel.is_anonymous) {
        channel_info = await sign_to_anon_post(
          client,
          userModel,
          targetUserModel,
          source_id,
          anonUserInfoFromSouce
        );
      } else if (userModel.is_anonymous && targetUserModel.is_anonymous) {
        channel_info = await anon_to_anon_post(
          client,
          userModel,
          targetUserModel,
          source_id,
          anonUserInfoFromSouce
        );
      }
      newChannel = client.channel('messaging', channel_info.channel_id, {
        members
      });
    }
    /// START
    const createdChannel = await newChannel.create();

    // get 100 messages
    const channelFilters = {cid: 'messaging:' + newChannel.id};
    const messageFilters = {created_at: {$lte: new Date()}};
    const messageHistory = await client.search(channelFilters, messageFilters, {
      sort: [{updated_at: -1}],
      limit: 100
    });
    const {betterChannelMember, betterChannelMemberObject, updatedChannel} =
      await BetterSocialCore.chat.updateBetterChannelMembers(newChannel, createdChannel, true, {
        channel_type: channel_type
      });

    const response = {
      ...updatedChannel,
      channel: {
        ...updatedChannel?.channel,
        messages: messageHistory?.results
      },
      better_channel_members: betterChannelMember,
      better_channel_members_object: betterChannelMemberObject,
      messageHistories: messageHistory?.results
    };
    await client.disconnectUser();

    return res.status(200).json(responseSuccess('sent', response));
  } catch (error) {
    await client.disconnectUser();
    return ErrorResponse.e400(res, error.message);
  }
};

module.exports = initChatFromPost;
