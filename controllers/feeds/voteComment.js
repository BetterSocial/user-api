const { voteComment } = require("../../services/getstream");
const { responseSuccess, responseError } = require("../../utils/Responses");

module.exports = async (req, res) => {
  try {
    let { activity_id, count_downvote, count_upvote, text, status } = req.body;
    if (status === "upvote") {
      count_upvote++;
    } else if (status === "downvote") {
      count_downvote++;
    }
    const newData = {
      count_downvote,
      count_upvote,
      text,
    };
    const data = await voteComment(activity_id, req.token, newData);
    return res.status(200).json(responseSuccess("Success upvote", data));
  } catch (error) {
    console.log("errro ", error);
    return res.status(500).json(responseError("Failed upvote", null, 500));
  }
};
