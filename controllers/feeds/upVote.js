const {
  upVote,
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
        let downvotes = latestReactions.downvotes;
        if (downvotes !== undefined) {
          downvotes.filter((item, i, arr) => item.user.id === req.userId);
          if (downvotes.length > 0) {
            let reaction = downvotes[0];
            deleteReaction(reaction.id);
          }
        }
      }
      const data = await upVote(activity_id, req.token);
      const { countProcess } = require("../../process");
      countProcess(activity_id, { upvote_count: +1 }, { upvote_count: 1 });
      return res.status(200).json(responseSuccess("Success upvote", data));
    } else {
      // let reactionId = feed.
      let data = feed.latest_reactions.upvotes.filter(
        (item, i, arr) => item.user.id === req.userId
      );

      if (data.length > 0) {
        let reaction = data[0];
        await deleteReaction(reaction.id);
      }
      res.status(200).json(responseSuccess("Success cancel upvote"));
    }
  } catch (errors) {
    console.log(errors);
    res.status(500).json(responseError("Failed upvote", null, 500));
  }
};
