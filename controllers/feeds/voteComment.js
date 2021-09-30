const { voteComment, downVote } = require("../../services/getstream");
const { responseSuccess, responseError } = require("../../utils/Responses");
const { VoteComments } = require("../../databases/models");
const uuid = require("uuid");
module.exports = async (req, res) => {
  try {
    let { activity_id, count_downvote, count_upvote, text, status } = req.body;
    let dataVote = await VoteComments.findOne({
      where: { comment_id: activity_id, user_id: req.userId },
    });
    let valueData = {
      id: uuid.v4(),
      comment_id: activity_id,
      user_id: req.userId,
      status: status,
    };
    if (status === "upvote") {
      if (dataVote && dataVote.status === "upvote") {
        count_upvote--;
        VoteComments.destroy({
          where: {
            comment_id: activity_id,
            user_id: req.userId,
          },
        });
      } else {
        if (dataVote) {
          count_downvote--;
          VoteComments.update(
            { status: status },
            { where: { comment_id: activity_id, user_id: req.userId } }
          );
        } else {
          VoteComments.create(valueData);
        }
        count_upvote++;
      }
    } else if (status === "downvote") {
      if (dataVote && dataVote.status === "downvote") {
        count_downvote--;
        VoteComments.destroy({
          where: {
            comment_id: activity_id,
            user_id: req.userId,
          },
        });
      } else {
        if (dataVote) {
          count_upvote--;
          VoteComments.update(
            { status: status },
            { where: { comment_id: activity_id, user_id: req.userId } }
          );
        } else {
          VoteComments.create(valueData);
        }
        count_downvote++;
      }
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
