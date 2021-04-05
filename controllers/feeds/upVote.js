const { upVote } = require("../../services/getstream");

module.exports = async (req, res) => {
  console.log("test");
  try {
    let { activity_id } = req.body;
    console.log(foreign_id);
    const upvote = await upVote(activity_id, req.token);
    return res.status(200).json({
      code: 200,
      status: "success",
      data: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      data: error,
    });
  }
};
