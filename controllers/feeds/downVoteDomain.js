const {downVote, getDetailFeed, deleteReaction} = require('../../services/getstream');
const {responseSuccess, responseError} = require('../../utils/Responses');

module.exports = async (req, res) => {
  try {
    const {token} = req;
    const {activity_id} = req.body;
    const feeds = await getDetailFeed(activity_id);
    const feed = feeds.results[0];

    const latestReactions = feed.latest_reactions;

    if (JSON.stringify(latestReactions) === '{}') {
      await downVote(activity_id, token);
      return res.status(200).json(responseSuccess('Success downvote'));
    }

    const downVotes = latestReactions.downvotes;
    const upVotes = latestReactions.upvotes;

    if (downVotes) {
      const newDownvotes = downVotes.filter((item) => item.user.id === req.userId);
      if (newDownvotes?.length > 0) {
        const reaction = newDownvotes[0];
        deleteReaction(reaction.id);
      }
    } else {
      if (upVotes) {
        const newUpvotes = upVotes.filter((item) => item.user.id === req.userId);
        if (newUpvotes?.length > 0) {
          const reaction = newUpvotes[0];
          deleteReaction(reaction.id);
        }
      }
      await downVote(activity_id, token);
    }

    return res.status(200).json(responseSuccess('Success downvote'));
  } catch (errors) {
    console.log(errors);
    return res.status(500).json(responseError('Failed downvote', null, 500));
  }
};
