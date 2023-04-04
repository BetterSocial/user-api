const getstreamService = require("../../services/getstream");
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
  NO_POLL_OPTION_UUID,
  BLOCK_FEED_KEY,
  BLOCK_POST_ANONYMOUS,
  GETSTREAM_RANKING_METHOD,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DATA_RETURN_LENGTH,
  POST_TYPE_LINK,
  GETSTREAM_TIME_LINEAR_RANKING_METHOD,
} = require("../../helpers/constants");
const {
  PollingOption,
  LogPolling,
  sequelize,
  UserFollowUser,
  DomainPage,
} = require("../../databases/models");
const { Op } = require("sequelize");
const {
  getListBlockUser,
  getListBlockPostAnonymous,
} = require("../../services/blockUser");
const getBlockDomain = require("../../services/domain/getBlockDomain");
const _ = require("lodash");
const lodash = require("lodash");
const { setData, getValue, delCache } = require("../../services/redis");
const { convertString } = require("../../utils/custom");
const { modifyPollPostObject } = require("../../utils/post");
const RedisDomainHelper = require("../../services/redis/helper/RedisDomainHelper");

module.exports = async (req, res) => {
  let { offset = 0, limit = MAX_FEED_FETCH_LIMIT } = req.query;
  let domainPageCache = {};

  let getFeedFromGetstreamIteration = 0;
  let data = [];
  try {
    const token = req.token;

    /**
     * lakukan pemeriksaan apakah user tersebut sudah memfollow dengan id tersebut
     */
    let userFollow = await UserFollowUser.findOne({
      where: {
        user_id_follower: req.params.id,
        user_id_followed: req.userId,
      },
    });

    while (data.length < MAX_DATA_RETURN_LENGTH) {
      if (
        getFeedFromGetstreamIteration === MAX_GET_FEED_FROM_GETSTREAM_ITERATION
      )
        break;

      let result = await getstreamService.getOtherFeeds(
        token,
        userFollow ? "user_excl" : "user",
        req.params.id,
        {
          reactions: { own: true, recent: true, counts: true },
          limit,
          offset,
          ranking: GETSTREAM_TIME_LINEAR_RANKING_METHOD,
        }
      );

      let feeds = result.results;
      // Change to conventional loop because map cannot handle await
      for (let i = 0; i < feeds.length; i++) {
        let item = feeds[i];
        let now = new Date();
        let dateExpired = new Date(item.expired_at);
        if (item.is_hide) {
          offset++;
          continue;
        }
        offset++;

        if (now < dateExpired || item.duration_feed == "never") {
          let newItem = { ...item };
          if (item.anonimity) continue;
          if (item.verb === POST_VERB_POLL) {
            newItem = await modifyPollPostObject(req.userId, item);
            data.push(newItem);
          } else {
            if (item.post_type === POST_TYPE_LINK) {
              if (item.post_type === POST_TYPE_LINK) {
                let domainPageId = item?.og?.domain_page_id;
                let credderScoreCache =
                  await RedisDomainHelper.getDomainCredderScore(domainPageId);
                if (credderScoreCache) {
                  newItem.credderScore = credderScoreCache;
                  newItem.credderLastChecked =
                    await RedisDomainHelper.getDomainCredderLastChecked(
                      domainPageId
                    );
                } else {
                  let dataDomain = await DomainPage.findOne({
                    where: { domain_page_id: domainPageId },
                    raw: true,
                  });

                  await RedisDomainHelper.setDomainCredderScore(
                    domainPageId,
                    dataDomain.credder_score
                  );
                  await RedisDomainHelper.setDomainCredderLastChecked(
                    domainPageId,
                    dataDomain.credder_last_checked
                  );

                  newItem.credderScore = dataDomain.credder_score;
                  newItem.credderLastChecked = dataDomain.credder_last_checked;
                }
              }
            }

            data.push(newItem);
          }
        }

        if (data.length === MAX_DATA_RETURN_LENGTH) break;
      }

      getFeedFromGetstreamIteration++;
    }

    res.status(200).json({
      code: 200,
      status: "success",
      data: data,
      offset,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error,
      offset,
    });
  }
};
