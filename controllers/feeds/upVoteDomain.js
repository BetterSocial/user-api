const {upVote, getDetailFeed, deleteReaction} = require('../../services/getstream');
const {responseSuccess, responseError} = require('../../utils/Responses');

module.exports = async (req, res) => {
  try {
    const {token} = req;
    const {activity_id} = req.body;
    const feeds = await getDetailFeed(activity_id);
    const feed = feeds.results[0];

    const latestReactions = feed.latest_reactions;

    if (JSON.stringify(latestReactions) === '{}') {
      await upVote(activity_id, token);
      return res.status(200).json(responseSuccess('Success upvote'));
    }

    const upVotes = latestReactions.upvotes;
    const downVotes = latestReactions.downvotes;

    if (upVotes) {
      const newUpvotes = upVotes.filter((item) => item.user.id === req.userId);
      if (newUpvotes?.length > 0) {
        const reaction = newUpvotes[0];
        deleteReaction(reaction.id);
      }
    } else {
      if (downVotes) {
        const newDownvotes = downVotes.filter((item) => item.user.id === req.userId);
        if (newDownvotes?.length > 0) {
          const reaction = newDownvotes[0];
          deleteReaction(reaction.id);
        }
      }
      await upVote(activity_id, token);
    }

    return res.status(200).json(responseSuccess('Success upvote'));
  } catch (errors) {
    console.log(errors);
    return res.status(500).json(responseError('Failed upvote', null, 500));
  }
};
