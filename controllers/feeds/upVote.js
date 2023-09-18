const {
  upVote,
  getReaction,
  validationReaction,
  getDetailFeed,
  deleteReaction
} = require('../../services/getstream');
const {responseSuccess, responseError} = require('../../utils/Responses');
const moment = require('moment');
const {addForUpvoteFeed, addForCancelUpvoteFeed} = require('../../services/score');
const {countProcess} = require('../../process');

module.exports = async (req, res) => {
  try {
    let token = req.token;
    let {activity_id, status, feed_group} = req.body;
    let feeds = await getDetailFeed(token, activity_id, feed_group);
    let feed = feeds.results[0];
    const scoringProcessData = {
      user_id: req.userId,
      feed_id: activity_id,
      activity_time: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    };

    if (status) {
      let latestReactions = feed.latest_reactions;
      if (JSON.stringify(latestReactions) !== '{}') {
        let downvotes = latestReactions.downvotes;
        if (downvotes !== undefined) {
          downvotes.filter((item, i, arr) => item.user_id === req.userId);
          if (downvotes.length > 0) {
            let reaction = downvotes[0];
            deleteReaction(reaction.id);
          }
        }
      }
      const data = await upVote(activity_id, req.token, feed.actor.id);
      countProcess(activity_id, {upvote_count: +1}, {upvote_count: 1});

      // Send message queue for upvote event
      await addForUpvoteFeed(scoringProcessData);

      return res.status(200).json(responseSuccess('Success upvote', data));
    } else {
      // let reactionId = feed.
      let latestReactions = feed.latest_reactions;
      let dataResponse = {};
      if (JSON.stringify(latestReactions) !== '{}') {
        let upvotes = latestReactions.upvotes;
        if (upvotes !== undefined && upvotes.length > 0) {
          let data = upvotes.filter((item, i, arr) => item.user_id === req.userId);

          if (data.length > 0) {
            let reaction = data[0];
            dataResponse = reaction;
            await deleteReaction(reaction.id);
          }
        }
      }
      countProcess(activity_id, {upvote_count: -1}, {upvote_count: 0});

      // Send message queue for cancel upvote event
      await addForCancelUpvoteFeed(scoringProcessData);

      res.status(200).json(responseSuccess('Success cancel upvote', dataResponse));
    }
  } catch (errors) {
    console.log(errors);
    res.status(500).json(responseError('Failed upvote', null, 500));
  }
};
