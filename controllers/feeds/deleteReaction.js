const { deleteReaction } = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    let { reaction_id } = req.body;

    let result = await deleteReaction(reaction_id, req.token);
    return res.status(200).json({
      code: 200,
      status: "Success delete reaction",
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      code: 400,
      status: "failed delete reaction",
      data: err.detail,
    });
  }
};
