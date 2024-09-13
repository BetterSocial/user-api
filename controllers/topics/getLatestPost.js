const {Topics} = require('../../databases/models');
const {StreamChat} = require('stream-chat');
const stream = require('getstream');

module.exports = async (req, res) => {
  const {name} = req.query;
  const {userId, token} = req;
  try {
    let topics = await Topics.findOne({
      where: {
        name: name
      }
    });

    if (!topics) {
      res.status(400).json({
        code: 400,
        message: 'Topic not found'
      });

      return;
    }

    const feedClient = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
    let feed = undefined;

    try {
      const clientFeed = feedClient.feed('topic', name, token);
      const topicFeed = await clientFeed.get({
        limit: 1,
        enrich: true
      });

      if (topicFeed?.results?.length < 1) {
        return res.status(400).json({
          success: false,
          message: 'This topic has no active post'
        });
      }

      feed = topicFeed?.results?.at(0);
    } catch (e) {
      console.error('Error getting feed', e);
    }

    let authorUsername = feed?.anonimity
      ? `${feed?.anon_user_info_color_name} ${feed?.anon_user_info_emoji_name}`
      : feed?.actor?.data?.username;

    let message = `There are new posts from ${authorUsername}`;

    const getstreamClient = new StreamChat(process.env.API_KEY, process.env.SECRET);
    let unreadCount = 0;
    try {
      await getstreamClient.connectUser({id: userId}, token);
      const userChannel = getstreamClient.channel('topics', `topic_${name}`);
      const createdChannel = await userChannel.watch();
      const readUsers = createdChannel?.read;
      const selfUserReadStatus = readUsers?.find((readStatus) => {
        return readStatus?.user?.id === userId;
      });

      unreadCount = selfUserReadStatus?.unread_messages || 0;
    } catch (e) {
      console.error('Error getting unread count', e);
    } finally {
      getstreamClient.disconnectUser();
    }

    if (feed?.anonimity) {
      feed.actor = {};
    }

    res.status(200).json({
      status: 'success',
      code: 200,
      data: {
        ...feed,
        message,
        unread_count: unreadCount
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
};
