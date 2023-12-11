const {QueryTypes} = require('sequelize');

const getTopicDetailById = async (sequelize, selfUserId, topicName) => {
  const query = `SELECT 
      topics.*, 
      COUNT(user_topics.topic_id) as topic_follower_count, 
      CASE COALESCE(user_following_topics.user_id, '') 
        WHEN '' THEN false
        ELSE true
      END as is_following
    FROM topics
    LEFT JOIN user_topics
      ON user_topics.topic_id = topics.topic_id
    LEFT JOIN user_topics AS user_following_topics
      ON user_following_topics.topic_id = topics.topic_id AND user_following_topics.user_id=:selfUserId
    WHERE topics.name=:topicName
    GROUP BY user_topics.topic_id, topics.topic_id, user_following_topics.user_id`;

  try {
    const response = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: {
        selfUserId,
        topicName
      }
    });

    return response?.[0];
  } catch (error) {
    console.error('Error on fetching topic detail');
    console.error(error);
    return null;
  }
};

module.exports = getTopicDetailById;
