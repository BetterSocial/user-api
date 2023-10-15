const {Topics} = require('../../../../databases/models');

const generateTopicSeeds = async () => {
  const bulks = [];

  for (let i = 0; i < 10; i++) {
    bulks.push({
      topic_id: parseInt(i, 10) + 1,
      name: `topic_name_${i}`,
      icon_path: 'icon_path',
      categories: i < 5 ? 'categories' : '',
      created_at: new Date(),
      flg_show: 'Y',
      is_custom_topic: i > 4,
      sort: parseInt(i, 10) + 1,
      deleted_at: null,
      sign: i < 5
    });
  }

  await Topics.bulkCreate(bulks);
  return {
    topics: bulks
  };
};

module.exports = generateTopicSeeds;
