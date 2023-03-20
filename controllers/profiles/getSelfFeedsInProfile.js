const getstreamService = require("../../services/getstream");
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
  NO_POLL_OPTION_UUID,
  BLOCK_FEED_KEY,
  BLOCK_POST_ANONYMOUS,
  GETSTREAM_RANKING_METHOD,
  GETSTREAM_TIME_LINEAR_RANKING_METHOD,
  POST_TYPE_LINK,
} = require("../../helpers/constants");
const {
  PollingOption,
  LogPolling,
  DomainPage,
  sequelize,
} = require("../../databases/models");

const _ = require("lodash");
const RedisDomainHelper = require("../../services/redis/helper/RedisDomainHelper");

module.exports = async (req, res) => {
  let { limit = MAX_FEED_FETCH_LIMIT, offset = 0 } = req.query
  let domainPageCache = {}

  const token = req.token;

  getstreamService
    .getFeeds(token, "user_excl", {
      reactions: { own: true, recent: true, counts: true },
      limit,
      offset,
      ranking: GETSTREAM_TIME_LINEAR_RANKING_METHOD,
    })

    .then(async (result) => {
      let data = [];
      let feeds = result.results;

      // Change to conventional loop because map cannot handle await
      for (let i = 0; i < feeds.length; i++) {
        let item = feeds[i];
        let now = new Date();
        let dateExpired = new Date(item.expired_at);
        if (now < dateExpired || item.duration_feed == "never") {
          let newItem = { ...item };

          if (newItem.anonimity) {
            newItem.actor = {}
            newItem.to = []
            newItem.origin = null
            newItem.object = ""
          }

          if (item.verb === POST_VERB_POLL && item?.polls?.length > 0) {
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
              `SELECT DISTINCT(user_id) from public.log_polling WHERE polling_id= :polling_id AND polling_option_id != :polling_option_id`,
              {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                  polling_id: item.polling_id,
                  polling_option_id: NO_POLL_OPTION_UUID,
                }
              }
            );
            let voteCount = distinctPollingByUserId[0].length;

            newItem.pollOptions = pollOptions;
            newItem.voteCount = voteCount;
            data.push(newItem);
          } else {
            if (item.post_type === POST_TYPE_LINK) {
              let domainPageId = item?.og?.domain_page_id
              let credderScoreCache = await RedisDomainHelper.getDomainCredderScore(domainPageId)
              if (credderScoreCache) {
                newItem.credderScore = credderScoreCache
                newItem.credderLastChecked = await RedisDomainHelper.getDomainCredderLastChecked(domainPageId)
              } else {
                let dataDomain = await DomainPage.findOne({
                  where: { domain_page_id: domainPageId },
                  raw: true
                })

                await RedisDomainHelper.setDomainCredderScore(domainPageId, dataDomain.credder_score)
                await RedisDomainHelper.setDomainCredderLastChecked(domainPageId, dataDomain.credder_last_checked)

                newItem.credderScore = dataDomain.credder_score
                newItem.credderLastChecked = dataDomain.credder_last_checked
              }
            }

            data.push(newItem);
          }
        }
      }

      res.status(200).json({
        code: 200,
        status: "success",
        data: data,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(403).json({
        status: "failed",
        data: null,
        error: err,
      });
    });
};
