const {Topics} = require('../../databases/models');

module.exports = async (req, res) => {
  try {
    let {name} = req.body;
    name = name.toLowerCase();
    let topics = await Topics.findOne({
      where: {
        name,
        deleted_at: null
      }
    });

    if (topics) {
      res.status(400).json({
        code: 400,
        status: 'failed',
        message: 'Topic already exists'
      });
    }

    await Topics.create({
      name,
      icon_path: '',
      is_custom_topic: true,
      created_at: new Date(),
      categories: ''
    });

    return res.status(200).json({
      success: true,
      message: 'Success'
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
