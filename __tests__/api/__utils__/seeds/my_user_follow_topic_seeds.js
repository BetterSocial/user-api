const TestConstants = require('../constant');
const {UserTopic, UserTopicHistory} = require('../../../../databases/models');

const generateMyUserFollowTopicSeeds = async (topics = [], withUnfollowing = false) => {
  const userTopicBulks = [];
  const userTopicHistoryBulks = [];

  for (let i = 0; i < 10; i++) {
    userTopicBulks.push({
      user_topics_id: parseInt(i, 10) + 1,
      user_id: TestConstants.MY_USER_ID,
      topic_id: topics[i].topic_id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    userTopicHistoryBulks.push({
      user_id: TestConstants.MY_USER_ID,
      topic_id: topics[i].topic_id,
      action: 'in',
      createdAt: new Date()
    });
  }

  await UserTopic.bulkCreate(userTopicBulks);
  await UserTopicHistory.bulkCreate(userTopicHistoryBulks);

  if (withUnfollowing) {
    let unfollowingTopicHistoryBulks = [];

    for (let i = 0; i < 3; i++) {
      await UserTopic.destroy({
        where: {
          user_id: TestConstants.MY_USER_ID,
          topic_id: topics[i].topic_id
        }
      });

      unfollowingTopicHistoryBulks.push({
        user_id: TestConstants.MY_USER_ID,
        topic_id: topics[i].topic_id,
        action: 'out',
        createdAt: new Date()
      });
    }

    await UserTopicHistory.bulkCreate(unfollowingTopicHistoryBulks);
  }

  return {
    userTopics: userTopicBulks,
    userTopicHistories: userTopicHistoryBulks
  };
};

module.exports = generateMyUserFollowTopicSeeds;
