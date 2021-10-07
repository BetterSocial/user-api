const { responseError, responseSuccess } = require("../../utils/Responses");
const { VoteComments } = require("../../databases/models");
module.exports = async (req, res) => {
  try {
    let data = {};
    let { activity_id } = req.body;
    let dataVote = await VoteComments.findOne({
      where: { comment_id: activity_id, user_id: req.userId },
    });
    if (dataVote === null) {
      data.action = "none";
    } else {
      data.action = dataVote.status;
    }
    return res.status(200).json(responseSuccess("Success", data));
  } catch (error) {
    console.log("error ", error);
    return res.status(500).json(responseError("Failed i vote", null, 500));
  }
};
