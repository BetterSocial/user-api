const {v4: uuid} = require('uuid');

const {UserTopic, UserTopicHistory} = require('../../../../databases/models');

const generateUserAndTopicSeeds = async (users = [], topics = []) => {
  let userTopicBulks = [];
  let userTopicHistoryBulks = [];

  users.map((user) => {
    userTopicBulks.push({
      user_topics_id: uuid(),
      user_id: user.user_id,
      topic_id: topics[0].topic_id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    userTopicHistoryBulks.push({
      user_id: user.user_id,
      topic_id: topics[0].topic_id,
      action: 'in',
      createdAt: new Date()
    });
  });

  await UserTopic.bulkCreate(userTopicBulks);
  await UserTopicHistory.bulkCreate(userTopicHistoryBulks);

  return {
    topics: topics,
    userTopics: userTopicBulks
  };
};

module.exports = generateUserAndTopicSeeds;
