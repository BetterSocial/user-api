const moment = require('moment');
const {downVote, getDetailFeed, deleteReaction} = require('../../services/getstream');
const {responseSuccess, responseError} = require('../../utils/Responses');
const {addForDownvoteFeed, addForCancelDownvoteFeed} = require('../../services/score');
const {countProcess} = require('../../process');

module.exports = async (req, res) => {
  try {
    const {activity_id, status} = req.body;
    const {
      results: [feed]
    } = await getDetailFeed(activity_id);

    const scoringData = {
      user_id: req.userId,
      feed_id: activity_id,
      activity_time: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    };

    if (status) {
      const latestReactions = feed.latest_reactions;
      if (JSON.stringify(latestReactions) !== '{}') {
        const {upvotes} = latestReactions;
        if (upvotes !== undefined) {
          const u = upvotes.filter((item) => item.user_id === req.userId);
          if (u.length > 0) {
            const reaction = u[0];
            deleteReaction(reaction.id);
          }
        }
      }
      const data = await downVote(activity_id, req.token, feed.actor.id);
      countProcess(activity_id, {downvote_count: +1}, {downvote_count: 1});

      // Send message queue for downvote event
      await addForDownvoteFeed(scoringData);

      return res.status(200).json(responseSuccess('Success downvote', data));
    }
    // let reactionId = feed.
    const latestReactions = feed.latest_reactions;
    let dataResponse = {};
    if (JSON.stringify(latestReactions) !== '{}') {
      const {downvotes} = latestReactions;
      if (downvotes !== undefined && downvotes.length > 0) {
        const data = downvotes.filter((item) => item.user_id === req.userId);

        if (data.length > 0) {
          const reaction = data[0];
          dataResponse = reaction;
          await deleteReaction(reaction.id);
        }
      }
    }
    countProcess(activity_id, {downvote_count: -1}, {downvote_count: 0});

    // Send message queue for downvote event
    await addForCancelDownvoteFeed(scoringData);

    return res.status(200).json(responseSuccess('Success cancel downvote', dataResponse));
  } catch (errors) {
    console.log(errors);
    return res.status(500).json(responseError('Failed downvote', null, 500));
  }
};
