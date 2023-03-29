const { User } = require("../../databases/models");
const Validator = require("fastest-validator");
const moment = require("moment");
const v = new Validator();
const updateUser = require("../../services/getstream/updateUser");

module.exports = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        user_id: req.userId,
      },
    });
    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "User not found",
      });
    } else {
      let myTs = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

      updateUser(req?.userId, {
        username: user.username,
        profile_pic_url: null,
      });
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          profile_pic_path: null,
          updated_at: myTs,
        },
        {
          where: { user_id: req?.userId },
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
