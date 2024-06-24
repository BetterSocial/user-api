const {sequelize, Post} = require('../../databases/models');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */

/**
 * Set to 9 because `hasUserPosted` will take 1 tag
 */
const MAX_USER_TOPIC_TAGS_ALLOWED = 9;

module.exports = async (req, res) => {
  const userId = req.userId;

  const followedOnboardingTopicQuery = `
    SELECT 
      Topics.name
    FROM user_topics UserTopics 
    INNER JOIN topics Topics 
      ON UserTopics.topic_id = Topics.topic_id
    WHERE UserTopics.user_id = :userId
    AND Topics.sign = true 
    AND Topics.categories IS NOT NULL
    ORDER BY Topics.sort ASC
    LIMIT ${MAX_USER_TOPIC_TAGS_ALLOWED}`;

  const topicHistoryQuery = `
    SELECT 
      DISTINCT name 
    FROM user_topic_history UserTopicsHistory 
    INNER JOIN topics Topics 
    ON UserTopicsHistory.topic_id = Topics.topic_id 
    WHERE UserTopicsHistory.user_id = :userId`;

  const topicHistoryQueryOperation = sequelize.query(topicHistoryQuery, {
    replacements: {
      userId
    }
  });

  const followedOnboardingTopicQueryOperation = sequelize.query(followedOnboardingTopicQuery, {
    replacements: {
      userId
    }
  });

  const hasUserPostedQueryOperation = Post.findAll({
    where: {
      author_user_id: userId
    },
    limit: 1,
    raw: true
  });

  const [followedOnboardingTopicQueryResult, topicHistoryQueryResult, hasUserPosted] =
    await Promise.all([
      followedOnboardingTopicQueryOperation,
      topicHistoryQueryOperation,
      hasUserPostedQueryOperation
    ]);

  res.json({
    status: 'success',
    code: 200,
    message: 'Success get topic user',
    data: {
      topics: followedOnboardingTopicQueryResult[0],
      history: topicHistoryQueryResult[0],
      hasUserPosted: hasUserPosted?.length > 0
    }
  });
};
