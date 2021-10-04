const { VoteComments } = require("../../databases/models");
const { getReaction } = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    let { activity_id } = req.body;
    let reaction = getReaction(activity_id);
    console.log("data ", reaction);
    return "hello";
  } catch (error) {
    return res.status(500).json(responseError("Failed list vote", null, 500));
  }
};
