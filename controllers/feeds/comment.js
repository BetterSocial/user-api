const { comment, notificationCommentFeed } = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    let body = req.body;
    body = {...body, kind: 'comment', userid: req.userId}
    let result = await comment(body.activity_id, body.message, req.token);
    await notificationCommentFeed(body)
    const { countProcess } = require("../../process");
    // save to db if character message > 80
    if (body.message.length > 80){
      await countProcess(body.activity_id, { comment_count: +1 }, { comment_count: 1 });
    }
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
