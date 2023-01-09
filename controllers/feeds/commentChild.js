const { commentChild } = require("../../services/getstream");
const QueueTrigger = require("../../services/queue/trigger");
module.exports = async (req, res) => {
  try {
    let { reaction_id, message, sendPostNotif, postMaker } = req?.body;

    let result = await commentChild(reaction_id, req.userId, req.body.useridFeed, message, req.token, sendPostNotif, req.body.postMaker);

    QueueTrigger.addCommentToDb({
      authorUserId: postMaker,
      comment: message,
      commenterUserId: req?.userId,
      commentId: result?.id,
      postId: result?.activity_id
    })

    return res.status(200).json({
      code: 200,
      status: "Success comment child",
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      code: 400,
      status: String(e),
      data: err.detail,
    });
  }
};
