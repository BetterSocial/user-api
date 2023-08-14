/* eslint-disable no-restricted-syntax */
const moment = require('moment');
const stream = require('getstream');
const {PollingOption, LogPolling, sequelize} = require('../../databases/models');
const {NO_POLL_OPTION_UUID, POST_TYPE_POLL} = require('../../helpers/constants');
const {getDetailFeed} = require('../../services/getstream');
const {responseSuccess} = require('../../utils/Responses');
const ErrorResponse = require('../../utils/response/ErrorResponse');

module.exports = async (req, res) => {
  const {id} = req.query;
  const feed = await getDetailFeed(req.token, id);
  const feedItem = feed.results[0];

  const feedExpiredAt = moment(feedItem?.expired_at);

  if (feedItem?.is_deleted) {
    return ErrorResponse.e404(res, 'This post has been deleted');
  }

  if (feedExpiredAt.isBefore(moment())) {
    return ErrorResponse.e404(res, 'This post has expired and has been deleted automatically');
  }

  const newItem = {...feedItem};
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
