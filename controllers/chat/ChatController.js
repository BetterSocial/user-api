const moment = require('moment');
const {StreamChat} = require('stream-chat');
const Validator = require('fastest-validator');
const {v4: uuidv4} = require('uuid');
const {responseSuccess, responseError} = require('../../utils/Responses');

const {User, ChatAnonUserInfo, Sequelize} = require('../../databases/models');

const {AddMembersChannel} = require('../../services/chat');
const addModerators = require('./addModerators');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const UsersFunction = require('../../databases/functions/users');
const BetterSocialConstantListUtils = require('../../services/bettersocial/constantList/utils');
const {CHANNEL_TYPE} = require('../../helpers/constants');
const ChatAnonUserInfoFunction = require('../../databases/functions/chatAnonUserInfo');
const BetterSocialCore = require('../../services/bettersocial');
const {
  is_all_anon_user,
  handle_anon_to_anon_channel_owner,
  handle_anon_to_anon_channel_member
} = require('../../services/bettersocial/chat/allAnonChat');

const v = new Validator();

module.exports = {
  createChannel: async (req, res) => {
    const schema = {
      members: 'string[]|empty:false',
      channelId: 'string|empty:false'
    };
    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated
      });

    const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    try {
      await client.connectUser({id: req.userId}, req.token);

      if (!req.body.members.includes(req.userId)) req.body.members.push(req.userId);

      const channel = client.channel('messaging', req.body.channelId, {
        members: req.body.members
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
      members: 'string[]|empty:false'
    };

    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated
      });

    const {channelId, members} = req.body;
    const {success, message} = await addModerators(channelId, members);
    if (!success)
      return res.status(403).json({
        success,
        message: 'Error creating channel',
        error: message
      });

    return res.status(200).json({
      success,
      message: 'Error creating channel',
      error: message
    });
  },
  addMembers: async (req, res) => {
    const members = [];
    members.push(req.userId);
    const channel = await AddMembersChannel('messaging', 'morris-heights', members);
    return res.status(200).json(responseSuccess('Success add members channel', channel));
  },
  getChannels: async (req, res) => {
    const client = new StreamChat(process.env.API_KEY, process.env.SECRET);
    try {
      let {last_fetch_date = null} = req.query;
      let filter = {members: {$in: [req.userId]}};
      if (last_fetch_date) {
        last_fetch_date = moment.utc(last_fetch_date).toDate().toISOString();
        filter = {members: {$in: [req.userId]}, last_message_at: {$gte: last_fetch_date}};
      }
      await client.connectUser({id: req.userId}, req.token);
      let channels = await client.queryChannels(filter, [{last_message_at: -1}]);

      // const createdChannel = await cha

      channels = channels.map((channel) => {
        const newChannel = {...channel.data};
        delete newChannel.config;
        delete newChannel.own_capabilities;

        const members = [];
        Object.keys(channel.state.members).forEach((member) => {
          members.push(channel?.state?.members[member]);
        });

        return {
          ...newChannel,
          members,
          messages: channel.state.messages
        };
      });
      return res.status(200).json(responseSuccess('Success retrieve channels', channels));
    } catch (error) {
      return res.status(error.statusCode ?? error.status ?? 400).json({
        status: 'error',
        code: error.statusCode ?? error.status ?? 400,
        message: error.message
      });
    } finally {
      await client.disconnectUser();
    }
  },
  getChannel: async (req, res) => {
    const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    try {
      await client.connectUser({id: req.userId}, req.token);
      const channel = await client.queryChannels({type: 'messaging', id: req.params.channelId}, [
        {last_message_at: -1}
      ]);
      await client.disconnectUser();
      if (!channel[0]) {
        return ErrorResponse.e404(res, 'Channel not found');
      }
      const {data} = channel[0];
      data.members = await Promise.all(
        Object.values(channel[0].state.members).map(async (dt) => {
          if (!dt.user.name) {
            const filter = {channel_id: req.params.channelId};
            if (dt.role === 'owner') {
              filter.my_anon_user_id = dt.user_id;
            } else {
              filter.target_user_id = dt.user_id;
            }
            const anonInfo = await ChatAnonUserInfo.findOne({where: filter});
            return {
              ...dt,
              anon_user_info_color_code: anonInfo.anon_user_info_color_code,
              anon_user_info_color_name: anonInfo.anon_user_info_color_name,
              anon_user_info_emoji_code: anonInfo.anon_user_info_emoji_code,
              anon_user_info_emoji_name: anonInfo.anon_user_info_emoji_name
            };
          }
          return dt;
        })
      );

      return res.status(200).json(responseSuccess('Success', data));
    } catch (error) {
      await client.disconnectUser();
      return res.status(error.statusCode ?? error.status ?? 400).json({
        status: 'error',
        code: error.statusCode ?? error.status ?? 400,
        message: error.message
      });
    }
  },
  initChat: async (req, res) => {
    const schema = {
      members: 'string[]|empty:false',
      message: 'string|empty:false'
    };
    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated
      });
    const {members, message} = req.body;
    if (!members.includes(req.userId)) members.push(req.userId);

    const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    try {
      const userModel = await UsersFunction.findUserById(User, req?.userId);
      const targetUserModel = await UsersFunction.findUserById(User, members[0]);
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

      const channel = client.channel('messaging', {members});

      await channel.create();
      try {
        if (!channel?.data?.name) {
          await channel.updatePartial({
            set: {
              channel_type: CHANNEL_TYPE.CHAT,
              name: [userModel?.username, targetUserModel?.username].join(', ')
            }
          });
        }
      } catch (e) {
        console.log(e);
      }

      const chat = await channel.sendMessage({
        user_id: req.userId,
        text: message,
        ...req.body
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
      anon_user_info_emoji_name: 'string|empty:false'
    };
    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated
      });
    const {
      members,
      message,
      anon_user_info_color_code,
      anon_user_info_color_name,
      anon_user_info_emoji_code,
      anon_user_info_emoji_name
    } = req.body;
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

      const channel = client.channel('messaging', {members});
      const createdChannel = await channel.create();

      const {betterChannelMember, betterChannelMemberObject} =
        await BetterSocialCore.chat.updateBetterChannelMembers(channel, createdChannel, true, {
          channel_type: CHANNEL_TYPE.ANONYMOUS,
          anon_user_info_color_code,
          anon_user_info_color_name,
          anon_user_info_emoji_code,
          anon_user_info_emoji_name
        });

      // Default mock chat in case of channel is blocked
      let chat = {
        message: {
          id: uuidv4(),
          cid: createdChannel?.channel?.id,
          text: message,
          message,
          user: {
            id: req.userId,
            name: `Anonymous ${anon_user_info_emoji_name}`,
            image: '',
            username: `Anonymous ${anon_user_info_emoji_name}`
          },
          created_at: new Date(),
          updated_at: new Date()
        }
      };

      if (!createdChannel?.channel?.is_channel_blocked) {
        chat = await channel.sendMessage({
          user_id: req.userId,
          text: message,
          ...req.body
        });
      }

      const targets = members.filter((member) => member !== req.userId);
      await targets.map(async (target) => {
        const exist = await ChatAnonUserInfo.count({
          where: {
            channel_id: channel.id,
            my_anon_user_id: req.userId,
            target_user_id: target
          }
        });

        if (!exist) {
          await ChatAnonUserInfo.create({
            channel_id: channel.id,
            my_anon_user_id: req.userId,
            target_user_id: target,
            anon_user_info_color_code,
            anon_user_info_color_name,
            anon_user_info_emoji_code,
            anon_user_info_emoji_name
          });
        }
      });

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

      await client.disconnectUser();

      const response = {
        ...chat,
        members: targetsUserModel,
        betterChannelMember,
        betterChannelMemberObject
      };

      if (createdChannel?.channel?.is_channel_blocked) {
        return res.status(400).json(responseError('Channel is blocked', response));
      }

      return res.status(200).json(responseSuccess('sent', response));
    } catch (error) {
      await client.disconnectUser();
      return ErrorResponse.e400(res, error.message);
    }
  },
  getMyAnonProfile: async (req, res) => {
    const {targetUserId} = req.params;

    const target = await UsersFunction.findUserById(User, targetUserId);

    if (!target) {
      return ErrorResponse.e404(req, 'target user not found');
    }
    const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    try {
      await client.connectUser({id: req.userId}, req.token);

      const channel = client.channel('messaging', {
        members: [targetUserId, req.userId]
      });

      await channel.create();

      const haveChat = await ChatAnonUserInfo.findOne({
        where: {
          channel_id: channel.id || '',
          target_user_id: targetUserId,
          my_anon_user_id: req.userId
        }
      });

      const emoji = BetterSocialConstantListUtils.getRandomEmoji();
      const color = BetterSocialConstantListUtils.getRandomColor();
      let anonUserInfo = {
        targetUserId,
        myAnonUserId: req.userId,
        anon_user_info_emoji_name: emoji.name,
        anon_user_info_emoji_code: emoji.emoji,
        anon_user_info_color_name: color.color,
        anon_user_info_color_code: color.code
      };

      if (haveChat) {
        anonUserInfo = {
          targetUserId,
          myAnonUserId: req.userId,
          anon_user_info_emoji_name: haveChat.anon_user_info_emoji_name,
          anon_user_info_emoji_code: haveChat.anon_user_info_emoji_code,
          anon_user_info_color_name: haveChat.anon_user_info_color_name,
          anon_user_info_color_code: haveChat.anon_user_info_color_code
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
    const {channelId} = req.params;
    const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    try {
      await client.connectUser({id: req.userId}, req.token);

      const channel = client.channel('messaging', channelId);

      await channel.watch();

      const readed = await channel.markRead();

      await client.disconnectUser();
      return res.status(200).json({data: readed});
    } catch (error) {
      await client.disconnectUser();
      return res.status(error.statusCode ?? error.status ?? 400).json({
        status: 'error',
        code: error.statusCode ?? error.status ?? 400,
        message: error.message
      });
    }
  },
  findOrCreateChannel: async (req, res) => {
    console.log('findOrCreateChannel', req.body);
    const schema = {
      members: 'string[]|empty:false'
    };
    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated
      });
    const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    const {members, oldChannelId, context = null} = req.body;

    /**
     *
     * @param {import('stream-chat').ChannelAPIResponse} channel
     * @param {*} anonUserInfo
     */
    const updateChannelAnonUserInfo = (apiChannel, anonUserInfo) => {
      apiChannel.channel.anon_user_info_color_code = anonUserInfo.anon_user_info_color_code;
      apiChannel.channel.anon_user_info_color_name = anonUserInfo.anon_user_info_color_name;
      apiChannel.channel.anon_user_info_emoji_code = anonUserInfo.anon_user_info_emoji_code;
      apiChannel.channel.anon_user_info_emoji_name = anonUserInfo.anon_user_info_emoji_name;
      apiChannel.channel.channel_type = CHANNEL_TYPE.ANONYMOUS;
    };

    try {
      await client.connectUser({id: req.userId}, req.token);
      let channel = null;
      // check if member are both anonymous
      if (!members.includes(req.userId)) members.push(req.userId);
      let is_anon_to_anon = await is_all_anon_user(members);
      if (is_anon_to_anon) {
        // check if channel already exist
        let new_channel = await handle_anon_to_anon_channel_owner(req.userId, members[0], context);
        await handle_anon_to_anon_channel_member(new_channel, members[0], oldChannelId, context);
        channel = client.channel('messaging', new_channel.channel_id, {
          members
        });
      } else {
        channel = client.channel('messaging', {
          members
        });
      }

      const findOrCreateChannel = await channel.create();
      findOrCreateChannel.members = await Promise.all(
        findOrCreateChannel.members.map(async (member) => {
          if (member.role !== 'owner' && !member.user?.username?.includes('Anonymous'))
            return member;

          let anonInfo = await ChatAnonUserInfo.findOne({
            where: {
              channel_id: findOrCreateChannel.channel.id,
              my_anon_user_id: member.user_id
            }
          });
          if (!anonInfo && oldChannelId && member.user_id !== req.userId) {
            let oldAnonInfo = await ChatAnonUserInfo.findOne({
              where: {
                channel_id: oldChannelId,
                my_anon_user_id: {
                  [Sequelize.Op.ne]: req.userId
                }
              }
            });
            if (oldAnonInfo) {
              anonInfo = oldAnonInfo;
              await ChatAnonUserInfoFunction.createChatAnonUserInfo(
                ChatAnonUserInfo,
                findOrCreateChannel.channel.id,
                member.user_id,
                req?.userId,
                {
                  anon_user_info_color_code: anonInfo.anon_user_info_color_code,
                  anon_user_info_color_name: anonInfo.anon_user_info_color_name,
                  anon_user_info_emoji_code: anonInfo.anon_user_info_emoji_code,
                  anon_user_info_emoji_name: anonInfo.anon_user_info_emoji_name
                }
              );
            }
          }

          let anonUserInfo = {};

          if (anonInfo) {
            anonUserInfo = anonInfo;
            updateChannelAnonUserInfo(findOrCreateChannel, anonUserInfo);
            return {
              ...member,
              anon_user_info_color_code: anonInfo.anon_user_info_color_code,
              anon_user_info_color_name: anonInfo.anon_user_info_color_name,
              anon_user_info_emoji_code: anonInfo.anon_user_info_emoji_code,
              anon_user_info_emoji_name: anonInfo.anon_user_info_emoji_name
            };
          }

          const emoji = BetterSocialConstantListUtils.getRandomEmoji();
          const color = BetterSocialConstantListUtils.getRandomColor();
          anonUserInfo = {
            anon_user_info_color_code: color.code,
            anon_user_info_color_name: color.color,
            anon_user_info_emoji_code: emoji.emoji,
            anon_user_info_emoji_name: emoji.name
          };

          updateChannelAnonUserInfo(findOrCreateChannel, anonUserInfo);
          await ChatAnonUserInfoFunction.createChatAnonUserInfo(
            ChatAnonUserInfo,
            findOrCreateChannel.channel.id,
            req?.userId,
            members[0],
            anonUserInfo
          );

          return {
            ...member,
            anon_user_info_color_code: color.code,
            anon_user_info_color_name: color.color,
            anon_user_info_emoji_code: emoji.emoji,
            anon_user_info_emoji_name: emoji.name
          };
        })
      );

      const {betterChannelMember, betterChannelMemberObject, updatedChannel} =
        await BetterSocialCore.chat.updateBetterChannelMembers(channel, findOrCreateChannel, true, {
          channel_type: CHANNEL_TYPE.ANONYMOUS
        });

      await client.disconnectUser();

      return res.status(200).json({
        ...updatedChannel,
        better_channel_member: betterChannelMember,
        better_channel_member_object: betterChannelMemberObject
      });
    } catch (error) {
      await client.disconnectUser();
      return ErrorResponse.e400(res, error.message);
    }
  }
};
