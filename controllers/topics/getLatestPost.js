const {QueryTypes} = require('sequelize');
const {sequelize, Topics} = require('../../databases/models');
const {StreamChat} = require('stream-chat');

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
    }

    let post_topics = await sequelize.query(
      `SELECT
        pt.topic_id,
        p.*,
        pAnonUserInfo.anon_user_info_color_code,
        pAnonUserInfo.anon_user_info_color_name,
        pAnonUserInfo.anon_user_info_emoji_code,
        pAnonUserInfo.anon_user_info_emoji_name,
        u.username,
        u.is_anonymous,
        u.profile_pic_path
      FROM posts p 
      INNER JOIN post_topics pt 
        ON p.post_id = pt.post_id
      INNER JOIN post_anon_user_info pAnonUserInfo
        ON pAnonUserInfo.post_id = p.getstream_activity_id
      INNER JOIN users u
        ON u.user_id = p.author_user_id
      WHERE 
        pt.topic_id = :topic_id
        AND p.duration >= now()
      ORDER BY created_at DESC
      LIMIT 1`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          topic_id: topics.topic_id
        },
        raw: true
      }
    );

    if (post_topics?.length < 1) {
      res.status(400).json({
        success: false,
        message: 'This topic has no active post'
      });
    }

    let post = post_topics?.at(0);

    let authorUsername = post?.is_anonymous
      ? `${post?.anon_user_info_color_name} ${post?.anon_user_info_emoji_name}`
      : post?.username;

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

    res.status(200).json({
      status: 'success',
      code: 200,
      data: {
        ...post,
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
