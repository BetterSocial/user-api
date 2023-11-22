const {StreamChat} = require('stream-chat');
const {User} = require('../../databases/models');
const {ResponseSuccess} = require('../../utils/Responses');
const UsersFunction = require('../../databases/functions/users');
const BetterSocialCore = require('../../services/bettersocial');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const getChannelDetail = async (req, res) => {
  const {channel_id, channel_type} = req.query;

  if (!channel_id || !channel_type) {
    return res.status(400).json({
      message: 'Bad request'
    });
  }

  const client = new StreamChat(process.env.API_KEY, process.env.SECRET);
  const channel = await client.channel(channel_type, channel_id);
  const createdChannel = await channel.create();

  const anonymousUser = await UsersFunction.findAnonymousUserId(User, req.userId, {raw: true});

  let messages = await __queryChannelHelper(client, channel_id, channel_type, req.userId);
  if (!messages) {
    messages = await __queryChannelHelper(client, channel_id, channel_type, anonymousUser?.user_id);
  }

  if (!messages) {
    return res.status(400).json({
      success: false,
      message: `You do not have permission to access this content, or the content has been deleted`
    });
  }

  const {betterChannelMember, betterChannelMemberObject} =
    await BetterSocialCore.chat.updateBetterChannelMembers(channel, createdChannel);

  return ResponseSuccess(res, 'Success', 200, {
    better_channel_members: betterChannelMember,
    better_channel_member_objects: betterChannelMemberObject,
    ...createdChannel,
    messages: messages?.results?.map((message) => message?.message)
  });
};

module.exports = getChannelDetail;

const __queryChannelHelper = async (client, channelId, channelType, userId) => {
  try {
    let messages = await client.search(
      {
        id: channelId,
        type: channelType,
        members: {
          $in: [userId]
        }
      },
      {
        created_at: {$lte: new Date()}
      },
      {
        sort: [{updated_at: -1}],
        limit: 10
      }
    );

    return messages;
  } catch (e) {
    console.debug(e);
    return null;
  }
};
