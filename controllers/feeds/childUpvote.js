const { childUpvote } = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    let { reaction_id } = req.body;
    let result = await childUpvote(reaction_id, req.token);
    const { upVotedProcess } = require("../../process");
    await upVotedProcess(reaction_id, req.token);
    return res.status(200).json({
      code: 200,
      status: "Success child upvote",
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      code: 400,
      status: "failed create comment",
      data: err.detail,
    });
  }
};
