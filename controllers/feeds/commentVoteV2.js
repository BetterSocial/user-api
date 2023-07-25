const Validator = require('fastest-validator');
const {voteComment} = require('../../services/getstream');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const Getstream = require('../../vendor/getstream');
const {VoteComments} = require('../../databases/models');
const {countProcess} = require('../../process');

const v = new Validator();

async function getResult(req, reaction, dbVote, targetFeeds) {
  let result;
  const {reaction_id, vote} = req.body;
  if (!dbVote) {
    if (req.userId !== reaction.user_id) {
      targetFeeds = [...targetFeeds, `notification:${req.userId}`];
    }
    await VoteComments.create({comment_id: reaction_id, user_id: req.userId, status: vote});
    if (vote === 'upvote') {
      const count_upvote = reaction.data.count_upvote + 1;
      [result] = await Promise.all([
        voteComment(reaction_id, req.token, {
          ...reaction.data,
          count_upvote,
          targetFeeds
        }),
        countProcess(reaction_id, {upvote_count: +1}, {upvote_count: 1})
      ]);
    } else {
      const count_downvote = reaction.data.count_downvote + 1;
      [result] = await Promise.all([
        voteComment(reaction_id, req.token, {
          ...reaction.data,
          count_downvote,
          targetFeeds
        }),
        countProcess(reaction_id, {downvote_count: +1}, {downvote_count: 1})
      ]);
    }
  } else if (dbVote.status === vote) {
    await VoteComments.destroy({
      where: {comment_id: reaction_id, user_id: req.userId}
    });
    if (vote === 'upvote') {
      const count_upvote = reaction.data.count_upvote - 1;
      [result] = await Promise.all([
        voteComment(reaction_id, req.token, {
          ...reaction.data,
          count_upvote,
          targetFeeds
        }),
        countProcess(reaction_id, {upvote_count: -1})
      ]);
    } else {
      const count_downvote = reaction.data.count_downvote - 1;
      [result] = await Promise.all([
        voteComment(reaction_id, req.token, {
          ...reaction.data,
          count_downvote,
          targetFeeds
        }),
        countProcess(reaction_id, {downvote_count: -1})
      ]);
    }
  } else {
    await VoteComments.update(
      {status: vote},
      {where: {comment_id: reaction_id, user_id: req.userId}}
    );
    if (vote === 'upvote') {
      const count_downvote = reaction.data.count_downvote - 1;
      const count_upvote = reaction.data.count_upvote + 1;
      [result] = await Promise.all([
        voteComment(reaction_id, req.token, {
          ...reaction.data,
          count_upvote,
          count_downvote,
          targetFeeds
        }),
        countProcess(reaction_id, {downvote_count: -1, upvote_count: +1}, {upvote_count: 1})
      ]);
    } else {
      const count_upvote = reaction.data.count_upvote - 1;
      const count_downvote = reaction.data.count_downvote + 1;
      [result] = await Promise.all([
        voteComment(reaction_id, req.token, {
          ...reaction.data,
          count_upvote,
          count_downvote,
          targetFeeds
        }),
        countProcess(reaction_id, {upvote_count: -1, downvote_count: +1}, {downvote_count: 1})
      ]);
    }
  }
  return result;
}

module.exports = async (req, res) => {
  try {
    const schema = {
      reaction_id: {type: 'string', empty: false},
      vote: {type: 'enum', values: ['upvote', 'downvote'], empty: false}
    };
    const validated = v.validate(req.body, schema);
    if (validated.length)
      return res.status(403).json({
        message: 'Error validation',
        error: validated
      });

    const {reaction_id} = req.body;
    const [reaction, dbVote] = await Promise.all([
      Getstream.feed.getReactionById(reaction_id),
      VoteComments.findOne({where: {comment_id: reaction_id, user_id: req.userId}})
    ]);
    const targetFeeds = [`notification:${reaction.user_id}`];
    const result = await getResult(req, reaction, dbVote, targetFeeds);

    return res.status(200).json(result);
  } catch (error) {
    return ErrorResponse.e400(res, error.message);
  }
};
