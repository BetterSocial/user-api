const {v4: uuid} = require('uuid');
const TestConstants = require('../constant');

const {LimitTopics, Topics, UserTopic} = require('../../../../databases/models');

const generateTopicAndUserTopics = async () => {
  await LimitTopics.create({
    limit: 10,
    created_at: new Date(),
    updated_at: new Date()
  });

  const topicBulks = [];
  const userTopicBulks = [];
  const iconPath = 'anypath';
  const topicId = 100;

  topicBulks.push({
    topic_id: topicId,
    name: 'Topic 1',
    sort: 1,
    categories: 'Category 1',
    icon_path: iconPath,
    created_at: new Date()
  });

  userTopicBulks.push({
    user_topics_id: uuid(),
    user_id: TestConstants.MY_USER_ID,
    topic_id: topicId,
    created_at: new Date(),
    updated_at: new Date()
  });

  topicBulks.push({
    topic_id: 200,
    name: 'Topic Outer',
    sort: 2,
    categories: 'Category 1',
    icon_path: iconPath,
    created_at: new Date()
  });

  for (let i = 3; i < 71; i++) {
    topicBulks.push({
      topic_id: i,
      name: 'Topic ' + i,
      sort: i,
      categories: 'Category ' + i,
      icon_path: iconPath,
      created_at: new Date()
    });

    userTopicBulks.push({
      user_topics_id: uuid(),
      user_id: TestConstants.MY_USER_ID,
      topic_id: i,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  await Topics.bulkCreate(topicBulks);
  await UserTopic.bulkCreate(userTopicBulks);
};

module.exports = generateTopicAndUserTopics;
