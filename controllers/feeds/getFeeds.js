const getstreamService = require('../../services/getstream');
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
  NO_POLL_OPTION_UUID,
  BLOCK_FEED_KEY,
  BLOCK_POST_ANONYMOUS,
} = require('../../helpers/constants');
const {
  PollingOption,
  LogPolling,
  sequelize,
} = require('../../databases/models');
const { Op } = require('sequelize');
const {
  getListBlockUser,
  getListBlockPostAnonymous,
} = require('../../services/blockUser');
const getBlockDomain = require('../../services/domain/getBlockDomain');
const _ = require('lodash');
const lodash = require('lodash');
const { setData, getValue, delCache } = require('../../services/redis');
module.exports = async (req, res) => {
  try {
    const token = req.token;
    const listBlockUser = await getListBlockUser(req.userId);
    const listBlockDomain = await getBlockDomain(req.userId);
    const listPostAnonymous = await getListBlockPostAnonymous(req.userId);

    getstreamService
      .getFeeds(token, 'main_feed', {
        limit: req.query.limit || MAX_FEED_FETCH_LIMIT,
        id_lt: req.query.id_lt || '',
        reactions: { own: true, recent: true, counts: true },
      })

      .then(async (result) => {
        let data = [];
        let feeds = result.results;
        let listBlock = String(listBlockUser + listBlockDomain);
        // let yFilter = listBlockUser.map((itemY) => {
        //   return itemY.user_id_blocked;
        // });
        // let filteredX = feeds.filter(
        //   (itemX) => !yFilter.includes(itemX.actor.id)
        // );
        // let newArr = feeds.reduce((feed, current) => {
        //   if (!yFilter.includes(current.actor.id)) {
        //     feed.push(current);
        //   }
        //   return feed;
        // }, []);

        let newArr = await _.filter(feeds, function (o) {
          return !listBlock.includes(o.actor.id);
        });

        let listAnonymous = listPostAnonymous.map((value) => {
          return value.post_anonymous_id_blocked;
        });

        let feedWithAnonymous = newArr.reduce((feed, current) => {
          if (!listAnonymous.includes(current.id)) {
            feed.push(current);
          }
          return feed;
        }, []);

        // Change to conventional loop because map cannot handle await
        for (let i = 0; i < feedWithAnonymous.length; i++) {
          let item = feedWithAnonymous[i];
          let now = new Date();
          let dateExpired = new Date(item.expired_at);
          if (now < dateExpired || item.duration_feed == 'never') {
            if (item.verb === POST_VERB_POLL) {
              let newItem = { ...item };
              let pollOptions = await PollingOption.findAll({
                where: {
                  polling_option_id: item.polls,
                },
              });

              let pollingOptionsId = pollOptions.reduce((acc, current) => {
                acc.push(current.polling_id);
                return acc;
              }, []);

              let logPolling = await LogPolling.findAll({
                where: {
                  polling_id: pollingOptionsId,
                  user_id: req.userId,
                },
              });

              if (logPolling.length > 0) {
                if (item.multiplechoice) newItem.mypolling = logPolling;
                else newItem.mypolling = logPolling[0];
                newItem.isalreadypolling = true;
              } else {
                newItem.isalreadypolling = false;
                newItem.mypolling = [];
              }

              let distinctPollingByUserId = await sequelize.query(
                `SELECT DISTINCT(user_id) from public.log_polling WHERE polling_id='${item.polling_id}' AND polling_option_id !='${NO_POLL_OPTION_UUID}'`
              );
              let voteCount = distinctPollingByUserId[0].length;

              newItem.pollOptions = pollOptions;
              newItem.voteCount = voteCount;
              data.push(newItem);
            } else {
              data.push(item);
            }
          }
        }

        res.status(200).json({
          code: 200,
          status: 'success',
          data: data,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({
          status: 'failed',
          data: null,
          error: err,
        });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: null,
      message: 'Internal server error',
      error: error,
    });
  }
};
