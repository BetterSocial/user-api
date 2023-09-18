const {User} = require('../../databases/models');
const Validator = require('fastest-validator');
const moment = require('moment');
const v = new Validator();

module.exports = async (req, res) => {
  try {
    let myTs = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const [, affectedRows] = await User.update(
      {
        bio: req.body.bio,
        updated_at: myTs
      },
      {
        where: {user_id: req?.userId},
        returning: true, // needed for affectedRows to be populated
        plain: true // makes sure that the returned instances are just plain objects
      }
    );
    if (affectedRows !== null || affectedRows !== undefined) {
      return res.json({
        status: 'success',
        code: 200,
        data: affectedRows
      });
    }
  } catch (error) {
    const {status, data} = error.response;
    return res.status(500).json({
      code: status,
      status: 'error',
      message: data
    });
  }
};
