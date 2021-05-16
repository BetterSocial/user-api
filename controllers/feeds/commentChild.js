const { commentChild } = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    let { reaction_id, message } = req.body;

    let result = await commentChild(reaction_id, message, req.token);
    return res.status(200).json({
      code: 200,
      status: "Success comment child",
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
