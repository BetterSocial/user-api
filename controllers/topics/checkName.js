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

    let response = {
      success: false,
      message: 'A community with this name already exists',
      available: false
    };

    if (topics) {
      response = {
        success: true,
        message: 'Community name available',
        available: true
      };
    }

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
