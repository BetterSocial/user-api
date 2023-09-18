const {
  downVote,
  getReaction,
  validationReaction,
  getDetailFeed,
  deleteReaction
} = require('../../services/getstream');
const {responseSuccess, responseError} = require('../../utils/Responses');
const moment = require('moment');
const {addForDownvoteFeed, addForCancelDownvoteFeed} = require('../../services/score');
const {countProcess} = require('../../process');

module.exports = async (req, res) => {
  try {
    let token = req.token;
    let {activity_id, status, feed_group} = req.body;
    console.log(status);
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
        let upvotes = latestReactions.upvotes;
        if (upvotes !== undefined) {
          let u = upvotes.filter((item, i, arr) => item.user_id === req.userId);
          if (u.length > 0) {
            let reaction = u[0];
            deleteReaction(reaction.id);
          }
        }
      }
      const data = await downVote(activity_id, req.token, feed.actor.id);
      countProcess(activity_id, {downvote_count: +1}, {downvote_count: 1});

      // Send message queue for downvote event
      await addForDownvoteFeed(scoringProcessData);

      return res.status(200).json(responseSuccess('Success downvote', data));
    } else {
      // let reactionId = feed.
      let latestReactions = feed.latest_reactions;
      let dataResponse = {};
      if (JSON.stringify(latestReactions) !== '{}') {
        let downvotes = latestReactions.downvotes;
        if (downvotes !== undefined && downvotes.length > 0) {
          let data = downvotes.filter((item, i, arr) => item.user_id === req.userId);

          if (data.length > 0) {
            let reaction = data[0];
            dataResponse = reaction;
            await deleteReaction(reaction.id);
          }
        }
      }
      countProcess(activity_id, {downvote_count: -1}, {downvote_count: 0});

      // Send message queue for downvote event
      await addForCancelDownvoteFeed(scoringProcessData);

      res.status(200).json(responseSuccess('Success cancel downvote', dataResponse));
    }
  } catch (errors) {
    console.log(errors);
    res.status(500).json(responseError('Failed downvote', null, 500));
  }
};
