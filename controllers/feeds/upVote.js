const {
  upVote,
  getReaction,
  validationReaction,
} = require("../../services/getstream");

module.exports = async (req, res) => {
  try {
    let { activity_id } = req.body;
    let result = await validationReaction(activity_id, "upvotes", req.token);
    if (result === true) {
      const data = await upVote(activity_id, req.token);
      const { countProcess } = require("../../process");
      await countProcess(activity_id, { upvote_count: +1 }, { upvote_count: 1 });
      return res.status(200).json({
        code: 200,
        status: "success",
        data: data,
      });
    } else {
      return res.status(400).json({
        code: 400,
        status: "failed",
        data: null,
        message: "anda sudah melakukan upvote",
      });
    }
  } catch (errors) {
    const { detail, status_code } = errors.error;
    return res.status(status_code).json({
      status: "error",
      data: "",
      message: detail,
    });
  }
};
