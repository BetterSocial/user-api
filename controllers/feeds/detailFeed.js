/* eslint-disable no-restricted-syntax */
const moment = require('moment');
const stream = require('getstream');
const {PollingOption, LogPolling, sequelize} = require('../../databases/models');
const {NO_POLL_OPTION_UUID, POST_TYPE_POLL} = require('../../helpers/constants');
const {getDetailFeed} = require('../../services/getstream');
const {responseSuccess} = require('../../utils/Responses');
const ErrorResponse = require('../../utils/response/ErrorResponse');
const UsersFunction = require('../../databases/functions/users');
const {User} = require('../../databases/models');
const roundingKarmaScore = require('../../helpers/roundingKarmaScore');

module.exports = async (req, res) => {
  const {id} = req.query;
  const feed = await getDetailFeed(req.token, id);
  const feedItem = feed.results[0];

  const feedExpiredAt = moment(feedItem?.expired_at);

  if (feedItem?.is_deleted) {
    return ErrorResponse.e404(res, 'This post has been deleted');
  }

  if (!feedItem) {
    return ErrorResponse.e404(res, 'Post not found');
  }

  if (feedExpiredAt.isBefore(moment())) {
    return ErrorResponse.e404(res, 'This post has expired and has been deleted automatically');
  }

  const myAnonymousUser = await UsersFunction.findAnonymousUserId(User, req.userId, {raw: true});

  const newItem = {...feedItem};
  // add karma score

  let actors = [newItem.actor.id];
  let comments = newItem.latest_reactions?.comment || [];
  const collectUserIds = (comment) => {
    if (comment?.user?.id && !actors.includes(comment.user.id)) {
      actors.push(comment.user.id);
    }
    comment?.latest_children?.comment?.forEach(collectUserIds);
  };
  comments.forEach(collectUserIds);

  const karmaScores = await UsersFunction.getUsersKarmaScore(User, actors);
  // add karma score in feed detail
  const user = karmaScores.find((user) => user.user_id === newItem.actor.id);
  newItem.karma_score = roundingKarmaScore(user?.karma_score || 0);
  // add karma score in comment
  comments = comments.map((comment) => {
    const user = karmaScores.find((user) => user.user_id === comment.user_id);
    comment.karma_score = roundingKarmaScore(user?.karma_score || 0);
    let sub_comments = comment.latest_children?.comment?.map((sub_comment) => {
      const user = karmaScores.find((user) => user.user_id === sub_comment.user_id);
      sub_comment.karma_score = roundingKarmaScore(user?.karma_score || 0);
      return sub_comment;
    });
    comment.latest_children.comment = sub_comments;
    return comment;
  });

  newItem.latest_reactions.comment = comments;

  newItem.is_self =
    newItem.actor.id === req.userId || newItem.actor.id === myAnonymousUser?.user_id;
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);

  if (newItem.anonimity) {
    newItem.actor = {};
    newItem.to = [];
    newItem.origin = null;
    newItem.object = '';
  }
  if (feedItem.post_type === POST_TYPE_POLL) {
    const pollOptions = await PollingOption.findAll({
      where: {
        polling_option_id: feedItem.polls
      },
      order: [['created_at', 'ASC']]
    });

    const pollingOptionsId = pollOptions.reduce((acc, current) => {
      acc.push(current.polling_id);
      return acc;
    }, []);

    const logPolling = await LogPolling.findAll({
      where: {
        polling_id: pollingOptionsId,
        user_id: req.userId
      }
    });

    if (logPolling.length > 0) {
      if (feedItem.multiplechoice) newItem.mypolling = logPolling;
      // eslint-disable-next-line prefer-destructuring
      else newItem.mypolling = logPolling[0];
      newItem.isalreadypolling = true;
    } else {
      newItem.isalreadypolling = false;
      newItem.mypolling = [];
    }

    const distinctPollingByUserId = await sequelize.query(
      `SELECT DISTINCT(user_id) from public.log_polling WHERE polling_id='${feedItem.polling_id}' AND polling_option_id !='${NO_POLL_OPTION_UUID}'`
    );
    const voteCount = distinctPollingByUserId[0].length;

    newItem.pollOptions = pollOptions;
    newItem.voteCount = voteCount;
  }
  const notification = await client.feed('notification', req.userId).get();
  const notifId = [];
  for (const item of notification.results) {
    notifId.push(item.id);
  }
  await client.feed('notification', req.userId).get({mark_read: notifId, mark_seen: notifId});

  return res.status(200).json(responseSuccess('success get detail feed', newItem));
};
