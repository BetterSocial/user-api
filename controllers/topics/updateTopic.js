const {Topics} = require('../../databases/models');

module.exports = async (req, res) => {
  try {
    const {icon, cover} = req.body;
    let {topicName} = req.params;
    topicName = topicName.toLowerCase();
    let response;

    let topics = await Topics.findOne({
      where: {
        name: topicName,
        deleted_at: null
      }
    });

    if (!topics) {
      response = {
        success: false,
        message: 'Community name not found'
      };

      return res.status(400).json(response);
    }

    if (!icon && !cover) {
      response = {
        code: 400,
        success: false,
        message: 'Please provide icon or cover'
      };

      return res.status(400).json(response);
    }

    let updateTopicData = {};
    if (icon) {
      updateTopicData.icon_path = icon;
    }
    if (cover) {
      updateTopicData.cover_path = cover;
    }

    await Topics.update(updateTopicData, {where: {topic_id: topics.topic_id}});

    response = {
      success: true,
      message: 'success updated topic details'
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.json({
      code: error.statusCode,
      status: 'fail',
      message: error.message,
      data: 'null'
    });
  }
};
