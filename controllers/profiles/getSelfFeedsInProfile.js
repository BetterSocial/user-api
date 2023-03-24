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
const { modifyPostLinkPost, modifyPollPostObject, filterFeeds } = require("../../utils/post");

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
      let data = await filterFeeds(req?.userId, result?.results || [])

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