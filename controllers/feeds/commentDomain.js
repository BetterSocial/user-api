const { comment } = require("../../services/getstream");
const { addForCommentPost } = require("../../services/score");
const moment = require("moment");
const commentDomain = require("../../services/getstream/commentDomain");

module.exports = async (req, res) => {
  try {
    let body = req.body;
    body = { ...body, kind: 'comment', userid: req.userId }
    let result = await commentDomain(body.activity_id, req.userId, body.useridFeed, body.message, req.token, body.sendPostNotif);
    const { countProcess } = require("../../process");
    // save to db if character message > 80
    if (body.message.length > 80) {
      await countProcess(body.activity_id, { comment_count: +1 }, { comment_count: 1 });
    }

    // send queue for scoring processing on comment a post
    const scoringProcessData = {
      comment_id: result.id,
      user_id: req.userId,
      feed_id: body.activity_id,
      message: body.message,
      activity_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
    };
    await addForCommentPost(scoringProcessData);

    return res.status(200).json({
      code: 200,
      status: "Success comment",
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      code: 400,
      message: String(err),
      data: err.detail,
    });
  }
};
