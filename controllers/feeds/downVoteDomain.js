const stream = require("getstream");
const {
  downVote,
  getReaction,
  validationReaction,
  getDetailFeed,
  deleteReaction,
} = require("../../services/getstream");
const { convertString } = require("../../utils");
const { responseSuccess, responseError } = require("../../utils/Responses");

const getDetail = async (feedGroup, id, activityId) => {
  const client = stream.connect(
    process.env.API_KEY,
    process.env.SECRET,
    process.env.APP_ID
  );
  return await client.feed(feedGroup, id).getActivityDetail(activityId, {
    withRecentReactions: true,
  });
};

module.exports = async (req, res) => {
  try {
    let token = req.token;
    let { activity_id, status, feed_group, domain } = req.body;
    console.log(status);
    let feeds = await getDetail(
      feed_group,
      convertString(domain, ".", "-"),
      activity_id
    );
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
      const data = await downVote(activity_id, token);
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
