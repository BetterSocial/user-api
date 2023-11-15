const {User, ChatAnonUserInfo} = require('../../databases/models');
const {StreamChat} = require('stream-chat');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const {responseSuccess} = require('../../utils/Responses');
const {CHANNEL_TYPE} = require('../../helpers/constants');
const UsersFunction = require('../../databases/functions/users');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const moveToSign = async (req, res) => {
  const {targetUser, oldChannelId} = req.body;

  let members = [targetUser];
  if (!members.includes(req.userId)) members.push(req.userId);

  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  try {
    const {userModel, targetUserModel} = await Promise.allSettled([
      UsersFunction.findUserById(User, req?.userId),
      UsersFunction.findUserById(User, targetUser)
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

        if (checkChatAnonUserInfo !== null) {
          await ChatAnonUserInfo.create({
            channel_id: newChannel.id,
            my_anon_user_id: req.userId,
            target_user_id: target,
            anon_user_info_color_code: checkChatAnonUserInfo?.anon_user_info_color_code,
            anon_user_info_color_name: checkChatAnonUserInfo?.anon_user_info_color_name,
            anon_user_info_emoji_code: checkChatAnonUserInfo?.anon_user_info_emoji_code,
            anon_user_info_emoji_name: checkChatAnonUserInfo?.anon_user_info_emoji_name
          });
        }
      }
    });

    try {
      if (!newChannel?.data?.name) {
        await newChannel.updatePartial({
          set: {
            channel_type: CHANNEL_TYPE.CHAT,
            name: [userModel?.username, targetUserModel?.username].join(', '),
            better_channel_member: newChannel.state.members
          }
        });
      }
    } catch (e) {
      console.log(e);
    }

    const targetsUserModel = await UsersFunction.findMultipleUsersById(User, targets);

    // get 100 messages
    const channelFilters = {cid: 'messaging:' + newChannel.id};
    const messageFilters = {created_at: {$lte: new Date()}};
    const messageHistory = await client.search(channelFilters, messageFilters, {
      sort: [{updated_at: -1}],
      limit: 100
    });

    const response = {
      channel: createdChannel,
      members: targetsUserModel,
      messageHistory: messageHistory.results
    };

    await client.disconnectUser();

    return res.status(200).json(responseSuccess('sent', response));
  } catch (error) {
    await client.disconnectUser();
    return ErrorResponse.e400(res, error.message);
  }
};

module.exports = moveToSign;
