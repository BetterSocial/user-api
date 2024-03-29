const {downVote, getDetailFeed, deleteReaction} = require('../../services/getstream');
const {responseSuccess, responseError} = require('../../utils/Responses');

module.exports = async (req, res) => {
  try {
    let token = req.token;
    let {activity_id} = req.body;
    let feeds = await getDetailFeed(token, activity_id);
    let feed = feeds.results[0];

    let latestReactions = feed.latest_reactions;

    if (JSON.stringify(latestReactions) === '{}') {
      await downVote(activity_id, token);
      return res.status(200).json(responseSuccess('Success downvote'));
    }

    let downVotes = latestReactions.downvotes;
    let upVotes = latestReactions.upvotes;

    if (downVotes) {
      const newDownvotes = downVotes.filter((item) => item.user.id === req.userId);
      if (newDownvotes?.length > 0) {
        let reaction = newDownvotes[0];
        deleteReaction(reaction.id);
      }
    } else {
      if (upVotes) {
        const newUpvotes = upVotes.filter((item) => item.user.id === req.userId);
        if (newUpvotes?.length > 0) {
          let reaction = newUpvotes[0];
          deleteReaction(reaction.id);
        }
      }
      await downVote(activity_id, token);
    }

    return res.status(200).json(responseSuccess('Success downvote'));
  } catch (errors) {
    console.log(errors);
    res.status(500).json(responseError('Failed downvote', null, 500));
  }
};
