const { downVote } = require("../../services/getstream");

module.exports = async (req, res) => {
  try {
    let { activity_id } = req.body;
    const downvote = await downVote(activity_id, req.token);
    console.log(downvote);
    return res.status(200).json({
      code: 200,
      status: "success",
      data: null,
    });
  } catch (errors) {
    const { detail, status_code } = errors.error;
    return res.status(status_code).json({
      status: "error",
      data: "",
      message: detail,
    });
  }
};
