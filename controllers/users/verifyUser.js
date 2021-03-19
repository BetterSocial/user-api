const { User } = require("../../databases/models");
module.exports = async (req, res) => {
  try {
    const user = await User.count({ where: { human_id: req.body.user_id } });
    return res.json({
      code: 200,
      data: user,
      message: "",
    });
  } catch (error) {
    const { status, data } = error.response;
    return res.json({
      code: status,
      data: 0,
      message: data,
    });
  }
};
