const { StreamChat } = require('stream-chat');
const Validator = require('fastest-validator');
const { responseSuccess, responseError } = require('../../utils/Responses');

const { User, ChatAnonUserInfo } = require('../../databases/models');

const formatLocationGetstream = require('../../helpers/formatLocationGetStream');
const { AddMembersChannel } = require('../../services/chat');
const addModerators = require('./addModerators');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const UsersFunction = require('../../databases/functions/users');
const BetterSocialConstantListUtils = require('../../services/bettersocial/constantList/utils');
const { Op } = require('sequelize');
const v = new Validator();

module.exports = {
  createChannel: async (req, res) => {
    const schema = {
      members: 'string[]|empty:false',
      channelId: 'string|empty:false',
    };
    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated,
      });

    const client = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    try {
      await client.connectUser({ id: req.userId }, req.token);

      if (!req.body.members.includes(req.userId))
        req.body.members.push(req.userId);

      const channel = client.channel('messaging', req.body.channelId, {
        members,
      });

      await channel.create();
      await client.disconnectUser();
      return res.status(200).json(responseSuccess('Success create channel'));
    } catch (error) {
      await client.disconnectUser();
      return res
        .status(error.code ?? error.status ?? 400)
        .json(responseError(error.message, error, error.code ?? error.status));
    }
  },
  addChannelModerator: async (req, res) => {
    const schema = {
      channelId: 'string|empty:false',
      members: 'string[]|empty:false',
    };

    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated,
      });

    let { channelId, members } = req.body;
    let { success, message } = await addModerators(
      channelId,
      members,
      req.token
    );
    if (!success)
      return res.status(403).json({
        success,
        message: 'Error creating channel',
        error: message,
      });

    return res.status(200).json({
      success,
      message: 'Error creating channel',
      error: message,
    });
  },
  addMembers: async (req, res) => {
    let members = [];
    members.push(req.userId);
    let channel = await AddMembersChannel(
      'messaging',
      'morris-heights',
      members
    );
    return res
      .status(200)
      .json(responseSuccess('Success add members channel', channel));
  },
  sendAnonymous: async (req, res) => {
    const schema = {
      channelId: 'string|empty:false',
      message: 'string|empty:false',
    };
    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated,
      });

    const { channelId, message } = req.body;

    const client = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    try {
      await client.connectUser({ id: req.userId }, req.token);

      const channel = client.channel('messaging', channelId);

      await channel.create();

      const chat = await channel.sendMessage({
        user_id: req.userId,
        text: message,
        ...req.body,
      });
      const channelMembers = await channel.queryMembers({
        id: { $ne: req.userId },
      });
      const userIds = channelMembers.members.map((member) => member.user_id);

      const anonReceivers = await ChatAnonUserInfo.findAll({
        where: {
          channel_id: channelId,
          target_user_id: req.userId,
          my_anon_user_id: { [Op.in]: userIds },
        },
      });

      await Promise.all(
        anonReceivers.map(async (chatInfo) => {
          // Send Push Notification
        })
      );

      await client.disconnectUser();
      return res.status(200).json(responseSuccess('sent', chat));
    } catch (error) {
      await client.disconnectUser();
      return res.status(error.statusCode ?? error.status ?? 400).json({
        status: 'error',
        code: error.statusCode ?? error.status ?? 400,
        message: error.message,
      });
    }
  },
  getChannels: async (req, res) => {
    const client = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    try {
      await client.connectUser({ id: req.userId }, req.token);
      let channels = await client.queryChannels(
        { type: 'messaging', members: { $in: [req.userId] } },
        [{ last_message_at: -1 }]
      );
      await client.disconnectUser();
      channels = channels.map((channel) => {
        return { ...channel.data };
      });
      return res
        .status(200)
        .json(responseSuccess('Success retrieve channels', channels));
    } catch (error) {
      await client.disconnectUser();
      return res.status(error.statusCode ?? error.status ?? 400).json({
        status: 'error',
        code: error.statusCode ?? error.status ?? 400,
        message: error.message,
      });
    }
  },
  getChannel: async (req, res) => {
    const client = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    try {
      await client.connectUser({ id: req.userId }, req.token);
      const channel = await client.queryChannels(
        { type: 'messaging', id: req.params.channelId },
        [{ last_message_at: -1 }]
      );
      await client.disconnectUser();
      if (!channel[0]) {
        return ErrorResponse.e404(res, 'Channel not found');
      }
      const { data } = channel[0];
      data.members = await Promise.all(
        Object.values(channel[0].state.members).map(async (dt) => {
          if (!dt.user.name) {
            const filter = { channel_id: req.params.channelId };
            if (dt.role === 'owner') {
              filter.myAnonUserId = dt.user_id;
            } else {
              filter.targetUserId = dt.user_id;
            }
            const anonInfo = await ChatAnonUserInfo.findOne({ where: filter });
            return {
              ...dt,
              anon_user_info_color_code: anonInfo.anon_user_info_color_code,
              anon_user_info_color_name: anonInfo.anon_user_info_color_name,
              anon_user_info_emoji_code: anonInfo.anon_user_info_emoji_code,
              anon_user_info_emoji_name: anonInfo.anon_user_info_emoji_name,
            };
          } else {
            return dt;
          }
        })
      );

      return res.status(200).json(responseSuccess('Success', data));
    } catch (error) {
      await client.disconnectUser();
      return res.status(error.statusCode ?? error.status ?? 400).json({
        status: 'error',
        code: error.statusCode ?? error.status ?? 400,
        message: error.message,
      });
    }
  },
  initChat: async (req, res) => {
    const schema = {
      members: 'string[]|empty:false',
      message: 'string|empty:false',
    };
    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated,
      });
    const { members, message } = req.body;
    if (!members.includes(req.userId)) members.push(req.userId);

    const client = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    try {
      await client.connectUser({ id: req.userId }, req.token);

      const channel = client.channel('messaging', { members });

      await channel.create();

      const chat = await channel.sendMessage({
        user_id: req.userId,
        text: message,
        ...req.body,
      });

      await client.disconnectUser();

      return res.status(200).json(responseSuccess('sent', chat));
    } catch (error) {
      await client.disconnectUser();
      return ErrorResponse.e400(res, error.message);
    }
  },
  initChatAnonymous: async (req, res) => {
    const schema = {
      members: 'string[]|empty:false',
      message: 'string|empty:false',
      anon_user_info_color_code: 'string|empty:false',
      anon_user_info_color_name: 'string|empty:false',
      anon_user_info_emoji_code: 'string|empty:false',
      anon_user_info_emoji_name: 'string|empty:false',
    };
    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated,
      });
    const {
      members,
      message,
      anon_user_info_color_code,
      anon_user_info_color_name,
      anon_user_info_emoji_code,
      anon_user_info_emoji_name,
    } = req.body;
    if (!members.includes(req.userId)) members.push(req.userId);

    const client = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    try {
      await client.connectUser({ id: req.userId }, req.token);

      const channel = client.channel('messaging', { members });

      await channel.create();

      const chat = await channel.sendMessage({
        user_id: req.userId,
        text: message,
        ...req.body,
      });

      const targets = members.filter((member) => member !== req.userId);
      targets.map(async (target) => {
        const exist = await ChatAnonUserInfo.count({
          where: {
            channel_id: channel.id,
            my_anon_user_id: req.userId,
            target_user_id: target,
          },
        });
        if (!exist) {
          await ChatAnonUserInfo.create({
            channel_id: channel.id,
            my_anon_user_id: req.userId,
            target_user_id: target,
            anon_user_info_color_code,
            anon_user_info_color_name,
            anon_user_info_emoji_code,
            anon_user_info_emoji_name,
          });
        }
      });

      await client.disconnectUser();

      return res.status(200).json(responseSuccess('sent', chat));
    } catch (error) {
      await client.disconnectUser();
      return ErrorResponse.e400(res, error.message);
    }
  },
  getMyAnonProfile: async (req, res) => {
    const targetUserId = req.params.targetUserId;

    const target = await UsersFunction.findUserById(User, targetUserId);

    if (!target) {
      return ErrorResponse.e404(req, 'target user not found');
    }
    const client = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    try {
      await client.connectUser({ id: req.userId }, req.token);

      const channel = client.channel('messaging', {
        members: [targetUserId, req.userId],
      });

      await channel.create();

      const haveChat = await ChatAnonUserInfo.findOne({
        where: {
          channel_id: channel.id || '',
          target_user_id: targetUserId,
          my_anon_user_id: req.userId,
        },
      });

      const emoji = BetterSocialConstantListUtils.getRandomEmoji();
      const color = BetterSocialConstantListUtils.getRandomColor();
      let anonUserInfo = {
        targetUserId: targetUserId,
        myAnonUserId: req.userId,
        anon_user_info_emoji_name: emoji.name,
        anon_user_info_emoji_code: emoji.emoji,
        anon_user_info_color_name: color.color,
        anon_user_info_color_code: color.code,
      };

      if (haveChat) {
        anonUserInfo = {
          targetUserId: targetUserId,
          myAnonUserId: req.userId,
          anon_user_info_emoji_name: haveChat.anon_user_info_emoji_name,
          anon_user_info_emoji_code: haveChat.anon_user_info_emoji_code,
          anon_user_info_color_name: haveChat.anon_user_info_color_name,
          anon_user_info_color_code: haveChat.anon_user_info_color_code,
        };
      }
      await client.disconnectUser();
      return res.status(200).json(responseSuccess('Success', anonUserInfo));
    } catch (error) {
      await client.disconnectUser();
      return ErrorResponse.e400(res, error.message);
    }
  },
  readChannel: async (req, res) => {
    const { channelId } = req.params;
    const client = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    try {
      await client.connectUser({ id: req.userId }, req.token);

      const channel = client.channel('messaging', channelId);

      await channel.watch();

      const readed = await channel.markRead();

      await client.disconnectUser();
      return res.status(200).json({ data: readed });
    } catch (error) {
      await client.disconnectUser();
      return res.status(error.statusCode ?? error.status ?? 400).json({
        status: 'error',
        code: error.statusCode ?? error.status ?? 400,
        message: error.message,
      });
    }
  },
};
