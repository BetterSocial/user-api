const getstreamService = require("../../services/getstream");
const moment = require('moment')
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
  GETSTREAM_TIME_LINEAR_RANKING_METHOD,
} = require("../../helpers/constants");
const {
  DomainPage,
} = require("../../databases/models");

const _ = require("lodash");
const { modifyPostLinkPost, modifyPollPostObject } = require("../../utils/post");

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
      for (let item of feeds) {
        let now = moment().valueOf()
        let dateExpired = moment(item?.expired_at).valueOf()

        if (dateExpired > now) continue
        let newItem = { ...item };

        if (newItem.anonimity) {
          newItem.actor = {}
          newItem.to = []
          newItem.origin = null
          newItem.object = ""
        }

        let isValidPollPost = item.verb === POST_VERB_POLL && item?.polls?.length > 0
        if (isValidPollPost) newItem = await modifyPollPostObject(req?.userId, newItem)
        else newItem = await modifyPostLinkPost(DomainPage, newItem)
        
        data.push(newItem);
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