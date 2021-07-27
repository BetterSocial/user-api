const stream = require("getstream");
const {
  upVote,
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
        let downvotes = latestReactions.downvotes;
        if (downvotes !== undefined) {
          downvotes.filter((item, i, arr) => item.user.id === req.userId);
          if (downvotes.length > 0) {
            let reaction = downvotes[0];
            deleteReaction(reaction.id);
          }
        }
      }
      const data = await upVote(activity_id, token);
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
