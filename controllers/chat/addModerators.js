const StreamChat = require('stream-chat').StreamChat;

module.exports = async (channelId, members) => {
  const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);

  try {
    await client.connectAnonymousUser();
    const filter = {type: 'messaging', members: {$in: members}};
    const sort = [{last_message_at: -1}];

    const channels = await client.queryChannels(filter, sort, {
      watch: true, // this is the default
      state: true
    });
    // const channel = await client.channel('messaging', channelId)
    await channels[0].addModerators(members);
    return {
      success: true,
      message: `successfully update channel`
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: e
    };
  }
};
