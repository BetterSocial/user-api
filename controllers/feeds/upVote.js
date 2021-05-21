const { upVote, getReaction } = require("../../services/getstream");

module.exports = async (req, res) => {
  try {
    let { activity_id } = req.body;
    let userId = req.userId;
    let result = await getReaction(activity_id, req.token);
    let status = false;
    if (result.user.id === userId) {
      status = true;
    }
    if (status) {
      return res.status(400).json({
        code: 400,
        status: "failed",
        data: null,
        message: "anda sudah melakukan upvote",
      });
    } else {
      const data = await upVote(activity_id, req.token);
      return res.status(200).json({
        code: 200,
        status: "success",
        data: data,
      });
    }
    // console.log(upvote);
  } catch (errors) {
    const { detail, status_code } = errors.error;
    return res.status(status_code).json({
      status: "error",
      data: "",
      message: detail,
    });
  }
};
