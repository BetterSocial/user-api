const { User } = require("../../databases/models");
const getstreamService = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    const user = await User.count({ where: { human_id: req.body.user_id } });
    const userData = await User.findOne({
      where: { human_id: req.body.user_id },
    });
    let userId = userData.user_id;
    console.log(userId);
    const token = await getstreamService.createToken(userId);
    return res.json({
      code: 200,
      data: user,
      message: "",
      token: token,
    });
  } catch (error) {
    // const { status, data } = error.response;
    // console.log(error);
    // return res.json({
    //   code: status,
    //   data: 0,
    //   message: data,
    // });
    return res.status(500).json({
      code: 500,
      data: 0,
      message: error,
    });
  }
};
