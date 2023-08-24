const {Op} = require('sequelize');
const groupBy = require('lodash/groupBy');
const mapValues = require('lodash/mapValues');
const pick = require('lodash/pick');
const {Topics, LimitTopics} = require('../../databases/models');

module.exports = async (req, res) => {
  try {
    const limits = await LimitTopics.findAll({
      attributes: ['limit'],
      order: [['id', 'DESC']],
      limit: 1
    });
    const {limit} = limits[0];
    const topics = await Topics.findAll({
      where: {
        deleted_at: null,
        sign: true,
        categories: {
          [Op.and]: {
            [Op.not]: null,
            [Op.ne]: ''
          }
        },
        sort: {
          [Op.and]: {
            [Op.not]: null
          }
        }
      },
      order: [['sort', 'ASC']]
    });

    const groupedTopics = groupBy(topics, (n) => n.categories);
    const limitedTopics = mapValues(groupedTopics, (group) =>
      group
        .slice(0, limit)
        .map((topic) =>
          pick(topic, [
            'topic_id',
            'name',
            'icon_path',
            'categories',
            'created_at',
            'flg_show',
            'is_custom_topic',
            'sort'
          ])
        )
    );
    return res.status(200).json({
      status: 'success',
      code: 200,
      body: limitedTopics
    });
  } catch (error) {
    return res.json({
      code: error.statusCode,
      status: 'fail',
      message: error.message,
      data: 'null'
    });
  }
};
