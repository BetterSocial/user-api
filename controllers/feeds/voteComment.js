const {voteComment, getReaction} = require('../../services/getstream');
const {responseSuccess, responseError} = require('../../utils/Responses');
const {VoteComments} = require('../../databases/models');
const uuid = require('uuid');
module.exports = async (req, res) => {
  try {
    let {activity_id, status} = req.body;
    let dataReaction = await getReaction(activity_id);
    let count_downvote = dataReaction.data.count_downvote;
    let count_upvote = dataReaction.data.count_upvote;
    let text = dataReaction.data.text;
    let targetFeeds = [`notification:${req.userId}`];
    if (req.userId !== dataReaction.user_id) {
      targetFeeds = [...targetFeeds, `notification:${dataReaction.user_id}`];
    }

    let dataVote = await VoteComments.findOne({
      where: {comment_id: activity_id, user_id: req.userId}
    });
    let valueData = {
      id: uuid.v4(),
      comment_id: activity_id,
      user_id: req.userId,
      status: status
    };
    if (status === 'upvote') {
      if (dataVote && dataVote.status === 'upvote') {
        count_upvote--;
        VoteComments.destroy({
          where: {
            comment_id: activity_id,
            user_id: req.userId
          }
        });
      } else {
        if (dataVote) {
          count_downvote--;
          VoteComments.update(
            {status: status},
            {where: {comment_id: activity_id, user_id: req.userId}}
          );
        } else {
          VoteComments.create(valueData);
        }
        count_upvote++;
      }
    } else if (status === 'downvote') {
      if (dataVote && dataVote.status === 'downvote') {
        count_downvote--;
        VoteComments.destroy({
          where: {
            comment_id: activity_id,
            user_id: req.userId
          }
        });
      } else {
        if (dataVote) {
          count_upvote--;
          VoteComments.update(
            {status: status},
            {where: {comment_id: activity_id, user_id: req.userId}}
          );
        } else {
          VoteComments.create(valueData);
        }
        count_downvote++;
      }
    }
    const newData = {
      ...dataReaction.data,
      count_downvote,
      count_upvote,
      text,
      targetFeeds
    };
    let data = await voteComment(activity_id, req.token, newData);
    if (dataReaction.data.anon_user_info_emoji_name) {
      data = {...data, user_id: null, user: {}, target_feeds: []};
    }
    return res.status(200).json(responseSuccess('Success vote comment', data));
  } catch (error) {
    console.log('errro ', error);
    return res.status(500).json(responseError('Failed vote', null, 500));
  }
};
