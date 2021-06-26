const {
  downVote,
  getReaction,
  validationReaction,
  getDetailFeed,
  deleteReaction,
} = require("../../services/getstream");
const { responseSuccess, responseError } = require("../../utils/Responses");

module.exports = async (req, res) => {
  try {
    let token = req.token;
    let { activity_id, status, feed_group } = req.body;
    console.log(status);
    let feeds = await getDetailFeed(token, activity_id, feed_group);
    let feed = feeds.results[0];

    if (status) {
      let latestReactions = feed.latest_reactions;
      if (JSON.stringify(latestReactions) !== "{}") {
        let upvotes = latestReactions.upvotes;
        if (upvotes !== undefined) {
          let u = upvotes.filter((item, i, arr) => item.user.id === req.userId);
          if (u.length > 0) {
            let reaction = u[0];
            deleteReaction(reaction.id);
          }
        }
      }
      const data = await downVote(activity_id, req.token);
      const { countProcess } = require("../../process");
      countProcess(activity_id, { downvote_count: +1 }, { downvote_count: 1 });
      return res.status(200).json(responseSuccess("Success downvote", data));
    } else {
      // let reactionId = feed.
      let data = feed.latest_reactions.downvotes.filter(
        (item, i, arr) => item.user.id === req.userId
      );

      if (data.length > 0) {
        let reaction = data[0];
        await deleteReaction(reaction.id);
      }
      res.status(200).json(responseSuccess("Success cancel downvote"));
    }
  } catch (errors) {
    console.log(errors);
    res.status(500).json(responseError("Failed downvote", null, 500));
  }
};
