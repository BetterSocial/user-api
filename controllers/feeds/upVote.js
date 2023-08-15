const moment = require('moment');
const {upVote, getDetailFeed, deleteReaction} = require('../../services/getstream');
const {responseSuccess, responseError} = require('../../utils/Responses');
const {addForUpvoteFeed, addForCancelUpvoteFeed} = require('../../services/score');
const {countProcess} = require('../../process');

module.exports = async (req, res) => {
  try {
    const {activity_id, status} = req.body;
    const feeds = await getDetailFeed(activity_id);
    const feed = feeds.results[0];
    const scoringProcessData = {
      user_id: req.userId,
      feed_id: activity_id,
      activity_time: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    };

    if (status) {
      const latestReactions = feed.latest_reactions;
      if (JSON.stringify(latestReactions) !== '{}') {
        const {downvotes} = latestReactions;
        if (downvotes !== undefined) {
          downvotes.filter((item) => item.user_id === req.userId);
          if (downvotes.length > 0) {
            const reaction = downvotes[0];
            deleteReaction(reaction.id);
          }
        }
      }
      const data = await upVote(activity_id, req.token, feed.actor.id);
      countProcess(activity_id, {upvote_count: +1}, {upvote_count: 1});

      // Send message queue for upvote event
      await addForUpvoteFeed(scoringProcessData);

      return res.status(200).json(responseSuccess('Success upvote', data));
    }
    // let reactionId = feed.
    const latestReactions = feed.latest_reactions;
    let dataResponse = {};
    if (JSON.stringify(latestReactions) !== '{}') {
      const {upvotes} = latestReactions;
      if (upvotes !== undefined && upvotes.length > 0) {
        const data = upvotes.filter((item) => item.user_id === req.userId);

        if (data.length > 0) {
          const reaction = data[0];
          dataResponse = reaction;
          await deleteReaction(reaction.id);
        }
      }
    }
    countProcess(activity_id, {upvote_count: -1}, {upvote_count: 0});

    // Send message queue for cancel upvote event
    await addForCancelUpvoteFeed(scoringProcessData);

    return res.status(200).json(responseSuccess('Success cancel upvote', dataResponse));
  } catch (errors) {
    console.log(errors);
    return res.status(500).json(responseError('Failed upvote', null, 500));
  }
};
