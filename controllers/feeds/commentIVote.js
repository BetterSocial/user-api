const { getReaction } = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    let { activity_id } = req.body;
    await getReaction(activity_id);
    return "hello";
  } catch (error) {
    return res.status(500).json(responseError("Failed list vote", null, 500));
  }
};
