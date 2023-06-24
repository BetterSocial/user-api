const moment = require('moment');
const { sequelize, Sequelize } = require('../../databases/models');
const { getTopicFeed } = require('../../services/getstream');

module.exports = async (req, res) => {
  try {
    const topicsFollowed = await sequelize.query(
      `SELECT * FROM public.topics A 
            INNER JOIN public.user_topics B
            ON A.topic_id = B.topic_id 
            WHERE B.user_id = :userId`,
      {
        replacements: { userId: req.userId },
        raw: true,
      }
    );

    const data = await Promise.all(
      topicsFollowed[0].map(async (topic) => {
        const post = await getTopicFeed(req.token, topic.name);

        const filteredTopics = post.results.filter(
          (top) =>
            moment(top.expired_at).isAfter(moment().utc()) &&
            moment(top.time).isAfter(moment(topic.last_read_at))
        );

        return { ...topic, badgeCount: filteredTopics.length };
      })
    );
    return res.status(200).json({
      code: 200,
      data,
      message: 'Get followed topic success',
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: 500,
      data: null,
      message: 'Internal server error',
      error: e,
    });
  }
};
