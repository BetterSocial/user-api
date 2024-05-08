const {Topics} = require('../../databases/models');
const {insertTopics} = require('../../utils/post');

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
      return res.status(400).json({
        code: 400,
        status: 'failed',
        message: 'Topic already exists'
      });
    }

    insertTopics([name]);

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
