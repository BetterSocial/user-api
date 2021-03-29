const { User } = require("../../databases/models");
const Validator = require("fastest-validator");
const moment = require("moment");
const v = new Validator();

module.exports = async (req, res) => {
  try {
    const schema = {
      real_name: "string|empty:false",
    };
    const validate = v.validate(req.body, schema);
    if (validate.length) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: validate,
      });
    }
    const user = await User.findByPk(req.params.id);
    let myTs = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "user not found",
      });
    } else {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          real_name: req.body.real_name.toLowerCase(),
          updated_at: myTs,
        },
        {
          where: { user_id: req.params.id },
          returning: true, // needed for affectedRows to be populated
          plain: true, // makes sure that the returned instances are just plain objects
        }
      );
      if (affectedRows !== null || affectedRows !== undefined) {
        return res.json({
          status: "success",
          code: 200,
          data: affectedRows,
        });
      }
    }
  } catch (error) {
    const { status, data } = error.response;
    return res.status(500).json({
      code: status,
      status: "error",
      message: data,
    });
  }
};
