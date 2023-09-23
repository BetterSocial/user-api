const {v4: uuid} = require('uuid');

const {Topics, UserTopic} = require('../../../../databases/models');

const generateUserAndTopicSeeds = async (users = []) => {
  const bulks = [];

  for (let i = 0; i < 10; i++) {
    bulks.push({
      topic_id: parseInt(i, 10) + 1,
      name: `topic_name_${i}`,
      icon_path: 'icon_path',
      categories: 'categories',
      is_custom_topic: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      sign: true
    });
  }

  await Topics.bulkCreate(bulks);
  const userTopicBulks = users.map((user) => {
    return {
      user_topics_id: uuid(),
      user_id: user.user_id,
      topic_id: bulks[0].topic_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  await UserTopic.bulkCreate(userTopicBulks);
  return {
    topics: bulks,
    userTopics: userTopicBulks
  };
};

module.exports = generateUserAndTopicSeeds;
