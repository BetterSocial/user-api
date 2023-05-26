const { StreamChat } = require('stream-chat');
const Validator = require('fastest-validator');
const { responseSuccess, responseError } = require('../../utils/Responses');

const { Locations } = require('../../databases/models');

const formatLocationGetstream = require('../../helpers/formatLocationGetStream');
const {
  CreateChannel,
  AddMembersChannel,
  WatchChannel,
} = require('../../services/chat');
const addModerators = require('./addModerators');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const v = new Validator();

module.exports = {
  createChannel: async (req, res) => {
    try {
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

      client.connectUser({ id: req.userId }, req.token);

      if (!req.body.members.includes(req.userId))
        req.body.members.push(req.userId);

      const channel = client.channel('messaging', req.body.channelId, {
        members,
      });

      await channel.create();
      return res.status(200).json(responseSuccess('Success create channel'));
    } catch (error) {
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
      channelId: 'string|optional:true',
      members: 'string[]|empty:false',
      message: 'string|empty:false',
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

    client.connectUser({ id: req.userId }, req.token);

    if (!req.body.members.includes(req.userId))
      req.body.members.push(req.userId);

    const channel = client.channel('messaging', req.body.channelId, {
      members: req.body.members,
    });

    await channel.create();

    const message = await channel.sendMessage({
      user_id: req.userId,
      text: req.body.message,
      ...req.body,
    });
    await client.disconnectUser();
    return res.status(200).json(responseSuccess('sent', message));
  },
  getChannels: async (req, res) => {
    const client = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    client.connectUser({ id: req.userId }, req.token);
    let channels = await client.queryChannels(
      { type: 'messaging', members: { $in: [req.userId] } },
      [{ last_message_at: -1 }]
    );
    channels = channels.map((channel) => {
      return { ...channel.data };
    });
    return res
      .status(200)
      .json(responseSuccess('Success retrieve channels', channels));
  },
  getChannel: async (req, res) => {
    const client = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    client.connectUser({ id: req.userId }, req.token);
    const channel = await client.queryChannels(
      { type: 'messaging', id: req.params.channelId },
      [{ last_message_at: -1 }]
    );
    if (!channel[0]) {
      return ErrorResponse.e404(res, 'Channel not found');
    }
    res.status(200).json(responseSuccess('Success', channel[0].data));
  },
};
