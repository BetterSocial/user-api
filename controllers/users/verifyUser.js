const { User } = require("../../databases/models");
const getstreamService = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    const userData = await User.findOne({
      where: { human_id: req.body.user_id },
    });
    let userId = userData.user_id;
    const token = await getstreamService.createToken(userId);
    return res.json({
      code: 200,
      data: Object.keys(userData).length === 0 ? false : true,
      message: "",
      token: token,
    });
  } catch (error) {
    // const { status, data } = error.response;
    // return res.json({
    //   code: status,
    //   data: 0,
    //   message: data,
    // });
    return res.status(200).json({
      code: 500,
      data: false,
      message: error,
    });
  }
};
