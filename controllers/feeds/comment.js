const { comment } = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    let { activity_id, message } = req.body;

    let result = await comment(activity_id, message, req.token);
    return res.status(200).json({
      code: 200,
      status: "Success comment",
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      code: 400,
      status: "failed create comment",
      data: err.detail,
    });
  }
};
